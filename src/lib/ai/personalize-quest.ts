import { Type } from "@google/genai";
import { GEMINI_MODELS, getGeminiClient } from "./gemini";
import type { Founder, GrowthProfile, QuestTemplate } from "@/types/database";

export interface PersonalizedQuestContent {
  title: string;
  instructions: string;
  tools_provided: Array<{ label: string; content: string }>;
  reasoning: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    instructions: { type: Type.STRING },
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
    reasoning: { type: Type.STRING },
  },
  required: ["title", "instructions", "tools_provided", "reasoning"],
};

type FounderContext = Pick<
  Founder,
  "company_name" | "industry" | "product_description" | "icp" | "weekly_hours"
>;
type GrowthContext = Pick<
  GrowthProfile,
  "what_working" | "what_not_working" | "bottleneck_hypothesis"
> | null;

function buildPrompt(founder: FounderContext, growth: GrowthContext, template: QuestTemplate) {
  const growthNotes = growth
    ? `What's working so far: ${JSON.stringify(growth.what_working)}
What's not working: ${JSON.stringify(growth.what_not_working)}
Current bottleneck hypothesis: ${growth.bottleneck_hypothesis ?? "none yet"}`
    : "No growth history yet — this is early.";

  return `You are personalizing a growth quest for a startup founder. Fill in every
{{placeholder}} in the template below using ONLY facts given about the founder.
Never invent specifics (names, numbers, claims) that aren't provided. If a
placeholder has no clear founder-specific value, write natural generic text
instead of leaving the placeholder in — the output must contain no {{ }}.

Founder:
- Company: ${founder.company_name ?? "unknown"}
- Industry: ${founder.industry ?? "unknown"}
- Product: ${founder.product_description ?? "unknown"}
- Target customer (ICP): ${founder.icp ?? "unknown"}
- Hours available per week for this: ${founder.weekly_hours ?? "unknown"}

Growth context:
${growthNotes}

Template title: ${template.title_template}
Template instructions: ${template.instructions_template}
Template tools: ${JSON.stringify(template.tool_templates)}

Return the personalized title, instructions, and tools_provided (same shape
as the template tools, content rewritten with placeholders filled in). If
the founder has limited hours available, scale the ask down (e.g. fewer
emails/posts) rather than changing the channel — "we size quests to fit."

Also return "reasoning": one short sentence, in a coach's voice, explaining
to the founder why this specific quest was picked for them right now
(reference their growth context when there is one, e.g. a channel that's
working or a stated bottleneck — otherwise reference their stage/ICP). This
is shown to the founder behind a "Why this?" toggle, so write it TO them
("You..."), not about them.`;
}

// Hybrid template+AI quest personalization (SPEC §7.1). Runs on the "fast"
// tier since this happens for every quest slot fill (SPEC §15). Returns
// null on any failure or guardrail violation so the caller falls back to
// the raw template rather than showing broken output (SPEC §17).
export async function personalizeQuestWithAI(
  founder: FounderContext,
  growth: GrowthContext,
  template: QuestTemplate,
): Promise<PersonalizedQuestContent | null> {
  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODELS.fast,
      contents: buildPrompt(founder, growth, template),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const raw = response.text;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersonalizedQuestContent;

    // Guardrails (SPEC §17): no empty fields, no leftover placeholders.
    if (!parsed.title?.trim() || !parsed.instructions?.trim() || !parsed.reasoning?.trim()) {
      return null;
    }
    if (/\{\{.*?\}\}/.test(JSON.stringify(parsed))) return null;

    return parsed;
  } catch {
    return null;
  }
}
