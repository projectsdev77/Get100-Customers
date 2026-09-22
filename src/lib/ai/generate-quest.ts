import { Type } from "@google/genai";
import { GEMINI_MODELS, getGeminiClient } from "./gemini";
import type { Founder, GrowthProfile } from "@/types/database";

export interface GeneratedQuest {
  title: string;
  instructions: string;
  category: string;
  xp_value: number;
  window_days: number;
  result_questions: Array<{ id: string; prompt: string; type: "number" | "text" | "boolean" }>;
  tools_provided: Array<{ label: string; content: string }>;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    instructions: { type: Type.STRING },
    category: { type: Type.STRING },
    xp_value: { type: Type.INTEGER },
    window_days: { type: Type.INTEGER },
    result_questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          prompt: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["number", "text", "boolean"] },
        },
        required: ["id", "prompt", "type"],
      },
    },
    tools_provided: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ["label", "content"],
      },
    },
  },
  required: ["title", "instructions", "category", "xp_value", "window_days", "result_questions"],
};

type FounderContext = Pick<
  Founder,
  "company_name" | "industry" | "product_description" | "icp" | "stage" | "channels_tried"
>;
type GrowthContext = Pick<
  GrowthProfile,
  "what_working" | "what_not_working" | "bottleneck_hypothesis"
> | null;

// Net-new quest generation for when no template fits (SPEC §7.1). Uses the
// "capable" tier since quality matters more than latency here (SPEC §15) —
// this is the fallback path, not the common one. One of exactly two quest
// creation paths (the other being personalizeQuestWithAI over a template);
// both write into the same `quests` row shape.
export async function generateNetNewQuest(
  founder: FounderContext,
  growth: GrowthContext,
): Promise<GeneratedQuest | null> {
  const growthNotes = growth
    ? `What's working: ${JSON.stringify(growth.what_working)}
What's not working: ${JSON.stringify(growth.what_not_working)}
Bottleneck hypothesis: ${growth.bottleneck_hypothesis ?? "none yet"}`
    : "No growth history yet.";

  const prompt = `You are a startup growth coach designing ONE concrete, actionable quest for
a founder trying to reach 100 customers. None of the existing quest
templates fit well, so invent a new one grounded in the founder's actual
business — never generic filler.

Founder:
- Company: ${founder.company_name ?? "unknown"}
- Industry: ${founder.industry ?? "unknown"}
- Product: ${founder.product_description ?? "unknown"}
- Target customer (ICP): ${founder.icp ?? "unknown"}
- Stage: ${founder.stage ?? "unknown"}
- Channels already tried: ${founder.channels_tried.join(", ") || "none yet"}

Growth context:
${growthNotes}

Design a single quest completable within a few days. category should be a
short snake_case channel label (e.g. cold_email, content, communities).
result_questions should be 2-4 short questions to ask when the founder
reports back, at least one boolean question with id "converted" asking
whether it led to a new customer. xp_value 6-15. window_days 1-5.`;

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODELS.capable,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const raw = response.text;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as GeneratedQuest;

    // Guardrails (SPEC §17): required fields present, sane bounds, no
    // fabricated-looking template syntax left in.
    if (!parsed.title?.trim() || !parsed.instructions?.trim() || !parsed.category?.trim()) {
      return null;
    }
    if (!parsed.result_questions?.some((q) => q.id === "converted" && q.type === "boolean")) {
      return null;
    }
    if (/\{\{.*?\}\}/.test(JSON.stringify(parsed))) return null;

    return {
      ...parsed,
      xp_value: Math.min(20, Math.max(5, parsed.xp_value || 10)),
      window_days: Math.min(7, Math.max(1, parsed.window_days || 3)),
      tools_provided: parsed.tools_provided ?? [],
    };
  } catch {
    return null;
  }
}
