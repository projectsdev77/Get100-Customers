import type { Founder, QuestTemplate } from "@/types/database";

// This picker has no AI to interpret free text, so matching a founder's
// stated focus (setNextFocus) to a channel relies on keywords rather than
// understanding — a founder typing "LinkedIn post" or "cold outreach"
// means the `content` or `cold_email` channel, but neither word appears
// in those category names themselves. Without this map, only someone who
// happened to type the literal internal category name (e.g. "content")
// would ever match, and everyone else's request would silently fall
// through to a random channel instead — which is what previously produced
// a personalized quest's reasoning openly admitting it couldn't match a
// plain request like "LinkedIn post" at all, even though a template for
// exactly that (content) existed and was eligible. Deliberately loose
// (substring match against common phrasing), since this is only the
// fallback tier — the AI-selection tier (select-quest.ts) handles the
// general case and is tried first.
const CATEGORY_ALIASES: Record<string, string[]> = {
  cold_email: ["cold email", "cold outreach", "email outreach", "emailing"],
  communities: ["community", "communities", "forum", "slack group", "discord"],
  content: [
    "linkedin",
    "twitter",
    "x post",
    "blog",
    "newsletter",
    "social media",
    "social post",
    "content",
  ],
  local_events: ["local event", "meetup", "conference", "in person", "in-person"],
  paid: ["paid ad", "advertising", "facebook ad", "google ad", "instagram ad"],
  partnerships: ["partnership", "partner up", "integration partner"],
  referrals: ["referral"],
  warm_intros: ["warm intro", "introduction", "my network"],
};

function intentMatchesCategory(intent: string, category: string): boolean {
  if (intent.includes(category.replace(/_/g, " "))) return true;
  return (CATEGORY_ALIASES[category] ?? []).some((alias) => intent.includes(alias));
}

// Rule-based quest selection (SPEC §7.1 Phase 3 — no AI yet). Filters by
// stage, then ranks candidates so channels the founder hasn't tried yet are
// preferred over ones they've already tried, before falling back to any
// eligible template. The AI personalization layer (Phase 5) replaces this
// ranking with growth-profile-driven selection, but keeps the same
// stage-filter contract.
export function pickTemplate(
  founder: Pick<Founder, "stage" | "channels_tried">,
  templates: QuestTemplate[],
  excludeTemplateIds: string[],
  founderIntent: string | null = null,
): QuestTemplate | null {
  const eligible = templates.filter((t) => {
    if (excludeTemplateIds.includes(t.id)) return false;
    if (t.stage_tags.length > 0 && founder.stage && !t.stage_tags.includes(founder.stage)) {
      return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

  if (founderIntent) {
    const intent = founderIntent.toLowerCase();
    const matching = eligible.filter((t) => intentMatchesCategory(intent, t.category));
    if (matching.length > 0) {
      return matching[Math.floor(Math.random() * matching.length)];
    }
  }

  const untried = eligible.filter((t) => !founder.channels_tried.includes(t.category));
  const pool = untried.length > 0 ? untried : eligible;

  return pool[Math.floor(Math.random() * pool.length)];
}

// Deterministic, non-AI reasoning (SPEC §17 fallback) — used when
// personalizeQuestWithAI fails or is skipped, so "Why this?" always has
// something grounded to show rather than nothing.
export function buildFallbackReasoning(
  founder: Pick<Founder, "channels_tried" | "stage">,
  template: QuestTemplate,
  founderIntent: string | null = null,
): string {
  const channel = template.category.replace(/_/g, " ");
  if (founderIntent && intentMatchesCategory(founderIntent.toLowerCase(), template.category)) {
    return `You asked to focus on ${channel}, so that's what this one is.`;
  }
  if (!founder.channels_tried.includes(template.category)) {
    return `You haven't tried ${channel} yet. Worth testing at your stage.`;
  }
  return `${channel} is a channel you've already tried, so we're giving it another pass.`;
}

export function templateToQuestFields(
  template: QuestTemplate,
  founder: Pick<Founder, "channels_tried" | "stage" | "buying_motion">,
  founderIntent: string | null = null,
) {
  // Templates carry a fixed default_window_days regardless of the founder —
  // for a sales-led founder that's too short to reach a real "converted"
  // answer, so it's widened here in code rather than needing motion-specific
  // template rows (SPEC gap #7's cheap path: sizing, not a new taxonomy).
  const windowDays =
    founder.buying_motion === "sales_led"
      ? Math.max(template.default_window_days * 2, 7)
      : template.default_window_days;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + windowDays);

  return {
    template_id: template.id,
    title: template.title_template,
    description: null,
    instructions: template.instructions_template,
    category: template.category,
    xp_value: template.default_xp,
    reasoning: buildFallbackReasoning(founder, template, founderIntent),
    tools_provided: template.tool_templates,
    result_questions: template.result_question_set,
    success_criteria: null,
    sub_tasks: [],
    suggested_window: `${windowDays} day${windowDays === 1 ? "" : "s"}`,
    expires_at: expiresAt.toISOString(),
    status: "suggested" as const,
  };
}
