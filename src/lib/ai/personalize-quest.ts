import { Type } from "@google/genai";
import { GEMINI_MODELS } from "./gemini";
import { generateStructuredContent } from "./generate-structured";
import type { Founder, GrowthProfile, QuestTemplate } from "@/types/database";

export interface PersonalizedQuestContent {
  title: string;
  instructions: string;
  tools_provided: Array<{ label: string; content: string }>;
  reasoning: string;
  steps: string[];
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
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "instructions", "tools_provided", "reasoning", "steps"],
};

type FounderContext = Pick<
  Founder,
  "company_name" | "industry" | "product_description" | "icp" | "weekly_hours"
>;
type GrowthContext = Pick<
  GrowthProfile,
  "what_working" | "what_not_working" | "bottleneck_hypothesis"
> | null;

function buildPrompt(
  founder: FounderContext,
  growth: GrowthContext,
  template: QuestTemplate,
  founderIntent: string | null,
) {
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
${
  founderIntent
    ? `\nThe founder asked to focus on this for their next quest: "${founderIntent}"
The channel/category for this quest was already picked before you were
called, so you can't change it — but reference their request directly in
your reasoning below: say plainly whether this quest's channel (${template.category.replace(
        /_/g,
        " ",
      )}) matches what they asked for, or, if it doesn't, that you couldn't
match their exact request this time and this is the closest available
option.\n`
    : ""
}
Return the personalized title, instructions, and tools_provided (same shape
as the template tools, content rewritten with placeholders filled in). If
the founder has limited hours available, scale the ask down (e.g. fewer
emails/posts) rather than changing the channel — "we size quests to fit."

Also return "steps": break the personalized instructions into checkable
tasks the founder ticks off one at a time as they work through it, usually
2-5. Each step must be a complete, self-contained unit of action, not a
fragment — "Identify 10 people who fit your ICP and find their contact
info via LinkedIn or a prospect list" is one step; "Open LinkedIn" is not.
Together the steps should cover the whole quest; don't just chop the
instructions text into sentences. If the quest is genuinely one single
action with nothing meaningful to split off, return just that one step —
never pad it with an artificial second step just to make a list.

Also return "reasoning": in a coach's voice, written TO the founder
("You..."), shown behind a "Why this?" toggle. ${
    founderIntent
      ? "Follow the instruction above about their stated focus."
      : `Start with why this specific
quest was picked for them right now (reference their growth context when
there is one, e.g. a channel that's working or a stated bottleneck —
otherwise reference their stage/ICP). If you have real growth context, add
a second sentence connecting this choice to it concretely — e.g. why this
addresses the stated bottleneck more directly than doubling down on what's
already working, or vice versa. If there's no growth history yet, one
sentence is enough — don't invent a tradeoff you don't have data for.`
  }`;
}

// Hybrid template+AI quest personalization (SPEC §7.1). Runs on the "fast"
// tier since this happens for every quest slot fill (SPEC §15). Returns
// null on any failure or guardrail violation so the caller falls back to
// the raw template rather than showing broken output (SPEC §17).
export async function personalizeQuestWithAI(
  founder: FounderContext,
  growth: GrowthContext,
  template: QuestTemplate,
  founderIntent: string | null = null,
): Promise<PersonalizedQuestContent | null> {
  try {
    const response = await generateStructuredContent({
      model: GEMINI_MODELS.fast,
      contents: buildPrompt(founder, growth, template, founderIntent),
      schema: RESPONSE_SCHEMA,
    });

    const raw = response.text;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersonalizedQuestContent;

    // Guardrails (SPEC §17): no empty fields, no leftover placeholders.
    if (!parsed.title?.trim() || !parsed.instructions?.trim() || !parsed.reasoning?.trim()) {
      return null;
    }
    if (/\{\{.*?\}\}/.test(JSON.stringify(parsed))) return null;

    const steps = (parsed.steps ?? []).map((s) => s.trim()).filter(Boolean);

    return { ...parsed, steps: steps.length > 0 ? steps : [parsed.instructions.trim()] };
  } catch (err) {
    console.error("personalizeQuestWithAI failed:", err);
    return null;
  }
}
