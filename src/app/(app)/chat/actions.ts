"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { getGrowthProfile, OCCUPYING_STATUSES, refreshQuestLog } from "@/lib/quests/lifecycle";
import { sendChatMessage, type ChatTurn } from "@/lib/ai/chat";
import { isFounderStuck } from "@/lib/growth-profile/stuck";
import { getSubscription, isRestricted } from "@/lib/subscriptions/status";
import { stripQuestIds } from "@/lib/utils/strip-ids";
import type { ChatMessage, Quest } from "@/types/database";

export interface ChatActionResult {
  id: string | null;
  reply: string;
  proposedSwapQuestId: string | null;
  proposedSwapReason: string | null;
}

export interface ChatHistoryMessage {
  id: string;
  role: "user" | "model";
  text: string;
  proposedSwapQuestId: string | null;
  proposedSwapReason: string | null;
  swapResolved: boolean;
}

const FALLBACK: ChatActionResult = {
  id: null,
  reply: "Sorry, I couldn't process that. Try again in a moment.",
  proposedSwapQuestId: null,
  proposedSwapReason: null,
};

// How many past turns get loaded into the widget and fed back to the AI as
// conversation context — real persistence, but bounded so a founder's
// lifetime chat history doesn't grow the prompt without limit. Summarizing
// older turns instead of a hard window is a reasonable next step once usage
// volume justifies the extra complexity.
const CHAT_HISTORY_LIMIT = 30;

function toHistoryMessage(row: ChatMessage): ChatHistoryMessage {
  return {
    id: row.id,
    role: row.role,
    // Cleans up any raw id a message stored before this fix, not just new
    // replies going forward.
    text: row.role === "model" ? stripQuestIds(row.text) : row.text,
    proposedSwapQuestId: row.proposed_swap_quest_id,
    proposedSwapReason: row.proposed_swap_reason,
    swapResolved: row.swap_resolved,
  };
}

// Loads the founder's persisted conversation (SPEC §10 follow-up — chat
// previously had zero memory, session-only in the browser) so reopening it,
// even in a new session days later, picks up where it left off.
export async function getChatHistory(): Promise<ChatHistoryMessage[]> {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return [];

  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("founder_id", founder.id)
    .order("created_at", { ascending: false })
    .limit(CHAT_HISTORY_LIMIT)
    .returns<ChatMessage[]>();

  return (data ?? []).reverse().map(toHistoryMessage);
}

export async function sendMessage(message: string): Promise<ChatActionResult> {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) {
    return { ...FALLBACK, reply: "You need to be signed in to chat." };
  }

  const subscription = await getSubscription(supabase, founder.id);
  if (isRestricted(subscription)) {
    return {
      ...FALLBACK,
      reply: "Your account is restricted. Please update your payment method to keep chatting.",
    };
  }

  const [growth, { data: quests }, { data: historyRows }] = await Promise.all([
    getGrowthProfile(supabase, founder.id),
    supabase
      .from("quests")
      .select("id, title, status")
      .eq("founder_id", founder.id)
      .in("status", OCCUPYING_STATUSES)
      .returns<Pick<Quest, "id" | "title" | "status">[]>(),
    supabase
      .from("chat_messages")
      .select("role, text")
      .eq("founder_id", founder.id)
      .order("created_at", { ascending: false })
      .limit(CHAT_HISTORY_LIMIT)
      .returns<Pick<ChatMessage, "role" | "text">[]>(),
  ]);

  // The authoritative history now lives in the database, not whatever the
  // client happened to be holding — this call no longer accepts a
  // client-supplied history param at all.
  const history: ChatTurn[] = (historyRows ?? [])
    .reverse()
    .map((row) => ({ role: row.role, text: row.text }));

  await supabase
    .from("chat_messages")
    .insert({ founder_id: founder.id, role: "user", text: message });

  const stuck = isFounderStuck(founder.current_customer_count, growth);
  const result = await sendChatMessage(founder, growth, quests ?? [], history, message, stuck);
  if (!result) return FALLBACK;

  // The model is handed each quest's raw id (so it can name one in
  // proposed_swap_quest_id) and occasionally echoes it into the reply text
  // itself — strip that before it's ever stored or shown (quests redesign §5).
  const reply = stripQuestIds(result.reply);

  const { data: inserted } = await supabase
    .from("chat_messages")
    .insert({
      founder_id: founder.id,
      role: "model",
      text: reply,
      proposed_swap_quest_id: result.proposedSwapQuestId,
      proposed_swap_reason: result.proposedSwapReason,
    })
    .select("id")
    .single<Pick<ChatMessage, "id">>();

  return {
    id: inserted?.id ?? null,
    reply,
    proposedSwapQuestId: result.proposedSwapQuestId,
    proposedSwapReason: result.proposedSwapReason,
  };
}

// Executes a chat-proposed quest swap only after the founder explicitly
// confirms in the UI (SPEC §10 — chat can propose, never auto-execute).
// Reuses the same skip → refill path as the quests page's own skip action.
// messageId (the proposing assistant turn) gets marked resolved so
// reopening chat later doesn't show a stale "Swap this quest" button.
export async function confirmSwap(
  questId: string,
  reason: string | null,
  messageId: string | null,
) {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase
    .from("quests")
    .update({
      status: "skipped",
      skip_reason: reason ? `AI-suggested: ${reason}` : "AI-suggested swap",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", questId)
    .eq("founder_id", founder.id)
    .in("status", OCCUPYING_STATUSES);

  if (messageId) {
    await supabase
      .from("chat_messages")
      .update({ swap_resolved: true })
      .eq("id", messageId)
      .eq("founder_id", founder.id);
  }
  await supabase
    .from("chat_messages")
    .insert({ founder_id: founder.id, role: "model", text: "Done. That quest is swapped." });

  await refreshQuestLog(supabase, founder);
  revalidatePath("/quests");
  revalidatePath("/dashboard");
}

// Founder declined a proposed swap — no quest change, just records that the
// proposal was seen and dismissed.
export async function dismissSwap(messageId: string) {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase
    .from("chat_messages")
    .update({ swap_resolved: true })
    .eq("id", messageId)
    .eq("founder_id", founder.id);

  await supabase
    .from("chat_messages")
    .insert({ founder_id: founder.id, role: "model", text: "Sounds good. Keeping it as is." });
}
