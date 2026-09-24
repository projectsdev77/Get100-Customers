import { Type } from "@google/genai";
import { GEMINI_MODELS } from "./gemini";
import { generateStructuredContent } from "./generate-structured";
import type { Founder, GrowthProfile, Quest } from "@/types/database";

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface ChatReply {
  reply: string;
  proposedSwapQuestId: string | null;
  proposedSwapReason: string | null;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING },
    proposed_swap_quest_id: { type: Type.STRING, nullable: true },
    proposed_swap_reason: { type: Type.STRING, nullable: true },
  },
  required: ["reply"],
};

type FounderContext = Pick<
  Founder,
  "company_name" | "industry" | "product_description" | "icp" | "current_customer_count"
>;
type GrowthContext = Pick<
  GrowthProfile,
  "what_working" | "what_not_working" | "bottleneck_hypothesis"
> | null;
type QuestContext = Pick<Quest, "id" | "title" | "status">;

function buildSystemInstruction(
  founder: FounderContext,
  growth: GrowthContext,
  quests: QuestContext[],
) {
  const questLines =
    quests.map((q) => `${q.id}: ${q.title} — ${q.status}`).join("\n") || "none yet";

  return `You are an AI growth coach chatting with a startup founder inside a
gamified app. Chat is a SECONDARY surface here — be concise, concrete, and
encouraging, not chatty. You can only PROPOSE actions, never execute them;
the founder always confirms explicitly (never claim you already did
something).

Founder:
- Company: ${founder.company_name ?? "unknown"}
- Industry: ${founder.industry ?? "unknown"}
- Product: ${founder.product_description ?? "unknown"}
- Target customer (ICP): ${founder.icp ?? "unknown"}
- Progress: ${founder.current_customer_count}/100 customers

Growth profile:
- What's working: ${JSON.stringify(growth?.what_working ?? [])}
- What's not working: ${JSON.stringify(growth?.what_not_working ?? [])}
- Bottleneck hypothesis: ${growth?.bottleneck_hypothesis ?? "none yet"}

Current quests (id: title — status):
${questLines}

If — and only if — the founder is asking for a different quest or seems
stuck on a specific active/suggested one, set proposed_swap_quest_id to
that quest's EXACT id from the list above (never invent an id) and explain
why in proposed_swap_reason. Otherwise leave both null.`;
}

// Secondary chat surface with full context (SPEC §10) — Gemini "capable"
// tier since conversational quality matters more than latency/cost here
// (SPEC §15). Returns null on any failure; the caller shows a fallback
// message rather than crashing the chat panel.
export async function sendChatMessage(
  founder: FounderContext,
  growth: GrowthContext,
  quests: QuestContext[],
  history: ChatTurn[],
  message: string,
): Promise<ChatReply | null> {
  try {
    const contents = [
      ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    const response = await generateStructuredContent({
      model: GEMINI_MODELS.capable,
      contents,
      systemInstruction: buildSystemInstruction(founder, growth, quests),
      schema: RESPONSE_SCHEMA,
    });

    const raw = response.text;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      reply: string;
      proposed_swap_quest_id?: string | null;
      proposed_swap_reason?: string | null;
    };
    if (!parsed.reply?.trim()) return null;

    const proposedId = parsed.proposed_swap_quest_id ?? null;
    // Guardrail: only trust a proposed id if it's one we actually listed —
    // never let a hallucinated id reach the confirm button (SPEC §17).
    const validId = proposedId && quests.some((q) => q.id === proposedId) ? proposedId : null;

    return {
      reply: parsed.reply,
      proposedSwapQuestId: validId,
      proposedSwapReason: validId ? (parsed.proposed_swap_reason ?? null) : null,
    };
  } catch (err) {
    console.error("sendChatMessage failed:", err);
    return null;
  }
}
