"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { getGrowthProfile, OCCUPYING_STATUSES, refreshQuestLog } from "@/lib/quests/lifecycle";
import { sendChatMessage, type ChatTurn } from "@/lib/ai/chat";
import { getSubscription, isRestricted } from "@/lib/subscriptions/status";
import type { Quest } from "@/types/database";

export interface ChatActionResult {
  reply: string;
  proposedSwapQuestId: string | null;
  proposedSwapReason: string | null;
}

const FALLBACK: ChatActionResult = {
  reply: "Sorry, I couldn't process that. Try again in a moment.",
  proposedSwapQuestId: null,
  proposedSwapReason: null,
};

export async function sendMessage(
  history: ChatTurn[],
  message: string,
): Promise<ChatActionResult> {
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

  const growth = await getGrowthProfile(supabase, founder.id);
  const { data: quests } = await supabase
    .from("quests")
    .select("id, title, status")
    .eq("founder_id", founder.id)
    .in("status", OCCUPYING_STATUSES)
    .returns<Pick<Quest, "id" | "title" | "status">[]>();

  const result = await sendChatMessage(founder, growth, quests ?? [], history, message);
  return result ?? FALLBACK;
}

// Executes a chat-proposed quest swap only after the founder explicitly
// confirms in the UI (SPEC §10 — chat can propose, never auto-execute).
// Reuses the same skip → refill path as the quests page's own skip action.
export async function confirmSwap(questId: string, reason: string | null) {
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

  await refreshQuestLog(supabase, founder);
  revalidatePath("/quests");
  revalidatePath("/dashboard");
}
