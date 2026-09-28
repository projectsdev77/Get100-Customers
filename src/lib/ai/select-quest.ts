import { Type } from "@google/genai";
import { GEMINI_MODELS } from "./gemini";
import { generateStructuredContent } from "./generate-structured";
import type { Founder, GrowthProfile, QuestTemplate } from "@/types/database";
import type { GeneratedQuest } from "./generate-quest";
import { MOTION_DESCRIPTIONS, windowDaysRange, maxWindowDays, motionPromptNote } from "./buying-motion";

// The fixed channel taxonomy (matches CHANNEL_VALUES in
// lib/founders/field-options.ts and every quest_templates.category value in
// supabase/seed.sql). Kept as a real enum in the schema — not free text —
// so the AI can't invent a category the growth-profile aggregation
// (recomputeGrowthProfile) and "your best channel" insights don't know
// about; recomputeGrowthProfile keys its stats straight off this column.
const CATEGORIES = [
  "cold_email",
  "warm_intros",
  "communities",
  "content",
  "paid",
  "partnerships",
  "referrals",
  "local_events",
] as const;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    instructions: { type: Type.STRING },
    category: { type: Type.STRING, enum: [...CATEGORIES] },
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
    reasoning: { type: Type.STRING },
  },
  required: [
    "title",
    "instructions",
    "category",
    "xp_value",
    "window_days",
    "result_questions",
    "reasoning",
  ],
};

type FounderContext = Pick<
  Founder,
  | "company_name"
  | "industry"
  | "product_description"
  | "icp"
  | "stage"
  | "channels_tried"
  | "weekly_hours"
  | "buying_motion"
>;
type GrowthContext = Pick<
  GrowthProfile,
  "what_working" | "what_not_working" | "bottleneck_hypothesis"
> | null;

// One entry per quest worth telling the AI about — both still-in-flight
// (active/suggested/in_progress/awaiting_report) and resolved
// (completed/skipped/expired) — so it can tell "already doing this" apart
// from "tried this and it flopped" apart from "explicitly skipped as not
// relevant", instead of only ever seeing what's currently on the log.
// `converted`/`skipReason` are null when they don't apply to that status.
export interface RecentQuestInfo {
  category: string | null;
  title: string;
  status: string;
  skipReason: string | null;
  converted: boolean | null;
}

// One example per category, straight from the template library, purely as
// a style/shape reference (tone, level of detail, {{placeholder}} spots
// left as-is) — never asked to fill these in, just to write its own quest
// the same way. Keeps the prompt small regardless of how many templates
// exist per category.
function buildStyleExamples(templates: QuestTemplate[]): string {
  const seen = new Set<string>();
  const examples: string[] = [];
  for (const t of templates) {
    if (seen.has(t.category)) continue;
    seen.add(t.category);
    examples.push(`- [${t.category}] "${t.title_template}" — ${t.instructions_template}`);
  }
  return examples.join("\n") || "(no examples available)";
}

// Renders each recent quest with whatever's actually known about how it
// went — an in-flight quest has no outcome yet, a completed one has
// converted true/false, a skip carries its reason — so the model can react
// differently to "already doing this" vs. "tried this, didn't convert" vs.
// "explicitly rejected as not relevant" instead of treating them the same.
function summarizeRecentQuests(recentQuests: RecentQuestInfo[]): string {
  if (recentQuests.length === 0) return "None yet — this is their first quest.";
  return recentQuests
    .map(({ category, title, status, skipReason, converted }) => {
      const cat = category ?? "unknown";
      if (status === "completed") {
        return `- [${cat}] Completed: "${title}" — ${converted ? "led to a customer" : "did not convert"}`;
      }
      if (status === "skipped") {
        return `- [${cat}] Skipped (reason: ${skipReason ?? "none given"}): "${title}"`;
      }
      if (status === "expired") {
        return `- [${cat}] Expired without being finished: "${title}"`;
      }
      return `- [${cat}] Currently ${status.replace(/_/g, " ")}: "${title}"`;
    })
    .join("\n");
}

function buildPrompt(
  founder: FounderContext,
  growth: GrowthContext,
  templates: QuestTemplate[],
  recentQuests: RecentQuestInfo[],
  founderIntent: string | null,
): string {
  const growthNotes = growth
    ? `What's working so far: ${JSON.stringify(growth.what_working)}
What's not working: ${JSON.stringify(growth.what_not_working)}
Current bottleneck hypothesis: ${growth.bottleneck_hypothesis ?? "none yet"}`
    : "No growth history yet — this is early, so favor a channel that fits their stage over one with no data either way.";

  return `You are a startup growth coach. Choose the SINGLE best next growth quest
for this founder right now, and design it yourself end-to-end — you are
not filling in a template, you are deciding what to do next based on
what's actually likely to move this founder toward their next customer.

Founder:
- Company: ${founder.company_name ?? "unknown"}
- Industry: ${founder.industry ?? "unknown"}
- Product: ${founder.product_description ?? "unknown"}
- Target customer (ICP): ${founder.icp ?? "unknown"}
- Stage: ${founder.stage ?? "unknown"}
- Channels already tried (from onboarding): ${founder.channels_tried.join(", ") || "none yet"}
- Hours available per week for this: ${founder.weekly_hours ?? "unknown"}
- How customers buy: ${founder.buying_motion ? MOTION_DESCRIPTIONS[founder.buying_motion] : "unknown"}

Growth history (category-level conversion stats):
${growthNotes}

Recent quest history for this founder, most recent first:
${summarizeRecentQuests(recentQuests)}
${
  founderIntent
    ? `\nThe founder has explicitly asked to focus on this for their NEXT quest: "${founderIntent}"
Take this seriously — a real coach listens to what their client actually
wants, not just what the data says. Honor it unless the history above
gives a genuine, specific reason not to (e.g. they're asking to repeat a
channel that's already failed repeatedly with no new angle). If you honor
it, say so plainly in your reasoning ("You asked to focus on X, so..."). If
you deviate, explain exactly why in your reasoning rather than silently
ignoring their request.\n`
    : ""
}
How to use that history:
- Never propose a quest worded near-identically to one already listed.
- A category that's currently in flight (still active/suggested/awaiting
  report) should usually be avoided this time, unless the growth history
  above genuinely justifies doubling down on it.
- A category skipped as "not_relevant" or "already_tried" should be
  avoided unless you have a real new angle — if you still pick it, say
  what's different in your reasoning.
- One completed-but-unconverted attempt in a category isn't a dead
  channel — that's normal — but two or more non-converting attempts in a
  row in the same category is a real signal to try something else, unless
  the growth history above shows it's still their best option.

"category" must be exactly one of: ${CATEGORIES.join(", ")}.

Style reference — one example per category showing this app's tone and
level of detail (the {{...}} spots are unfilled placeholders in the
template library, not something to copy; write your own quest in plain,
finished language, no placeholders):
${buildStyleExamples(templates)}

Design a single quest scoped to fit the founder's available hours per week
(a smaller ask for fewer hours, not a different channel — "we size quests
to fit"). result_questions should be 2-4 short questions to ask when the
founder reports back, at least one boolean question with id "converted"
asking whether it led to a new customer. xp_value 6-15. window_days ${windowDaysRange(
    founder.buying_motion,
  )}.${motionPromptNote(founder.buying_motion)}

Also return "reasoning": 2-3 sentences, in a coach's voice, written TO the
founder ("You..."). Start with why you picked this quest and channel right
now — reference their growth history if there is one, otherwise their
stage/ICP/channels tried. ${
    founderIntent
      ? `Since they told you what to focus on, use this reasoning to honor
their request or explain a deviation from it, as instructed above.`
      : `Then name ONE specific alternative you considered and passed on —
another channel from their history, an in-flight quest they could double
down on instead, or repeating something that already worked — and say
concretely why this beats it right now. Don't just say "other options
exist"; name the actual one and the actual reason.`
  } Shown behind a "Why this?" toggle in the app.`;
}

// Primary quest-selection path (SPEC §7.1's "Phase 5: AI personalization
// layer replaces this ranking with growth-profile-driven selection" —
// select-template.ts's pickTemplate was Phase 3's placeholder for this and
// stayed purely random/rule-based). The AI now chooses the channel/category
// itself instead of a template being picked deterministically first, using
// the founder's growth history so repeated quests reflect what's actually
// converting rather than a random eligible template. Templates are only a
// style reference here, not a menu — they remain the fallback path (see
// buildQuestInsertFields in lifecycle.ts) for when this call fails or its
// output fails the guardrails below, so quest generation degrades to the
// exact previous behavior rather than ever breaking.
export async function selectNextQuestWithAI(
  founder: FounderContext,
  growth: GrowthContext,
  templates: QuestTemplate[],
  recentQuests: RecentQuestInfo[],
  founderIntent: string | null = null,
): Promise<GeneratedQuest | null> {
  try {
    // "fast" tier: this now runs on every quest-slot refill (the same
    // frequency personalizeQuestWithAI used to run at), not the rare
    // once-per-founder case generateNetNewQuest was built for — SPEC §15's
    // cost tiering calls for the cheaper tier at this frequency. (Both
    // tiers currently point at the same model — see gemini.ts — so this
    // only matters once a paid capable tier is turned on.)
    const response = await generateStructuredContent({
      model: GEMINI_MODELS.fast,
      contents: buildPrompt(founder, growth, templates, recentQuests, founderIntent),
      schema: RESPONSE_SCHEMA,
    });

    const raw = response.text;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as GeneratedQuest;

    // Guardrails (SPEC §17): required fields present, category is really
    // one of the known channels (belt-and-suspenders on top of the schema
    // enum — the Groq fallback only gets the schema as a text instruction,
    // not enforced structured output, so it can't be trusted to respect
    // the enum the way Gemini's structured output does), a "converted"
    // result question exists, and no leftover template syntax.
    if (
      !parsed.title?.trim() ||
      !parsed.instructions?.trim() ||
      !parsed.reasoning?.trim() ||
      !(CATEGORIES as readonly string[]).includes(parsed.category)
    ) {
      return null;
    }
    if (!parsed.result_questions?.some((q) => q.id === "converted" && q.type === "boolean")) {
      return null;
    }
    if (/\{\{.*?\}\}/.test(JSON.stringify(parsed))) return null;

    return {
      ...parsed,
      xp_value: Math.min(20, Math.max(5, parsed.xp_value || 10)),
      window_days: Math.min(maxWindowDays(founder.buying_motion), Math.max(1, parsed.window_days || 3)),
      tools_provided: parsed.tools_provided ?? [],
    };
  } catch (err) {
    console.error("selectNextQuestWithAI failed:", err);
    return null;
  }
}
