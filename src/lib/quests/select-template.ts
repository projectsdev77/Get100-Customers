import type { Founder, QuestTemplate } from "@/types/database";

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
): QuestTemplate | null {
  const eligible = templates.filter((t) => {
    if (excludeTemplateIds.includes(t.id)) return false;
    if (t.stage_tags.length > 0 && founder.stage && !t.stage_tags.includes(founder.stage)) {
      return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

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
): string {
  if (!founder.channels_tried.includes(template.category)) {
    return `You haven't tried ${template.category.replace(/_/g, " ")} yet. Worth testing at your stage.`;
  }
  return `${template.category.replace(/_/g, " ")} is a channel you've already tried, so we're giving it another pass.`;
}

export function templateToQuestFields(
  template: QuestTemplate,
  founder: Pick<Founder, "channels_tried" | "stage">,
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + template.default_window_days);

  return {
    template_id: template.id,
    title: template.title_template,
    description: null,
    instructions: template.instructions_template,
    category: template.category,
    xp_value: template.default_xp,
    reasoning: buildFallbackReasoning(founder, template),
    tools_provided: template.tool_templates,
    result_questions: template.result_question_set,
    success_criteria: null,
    sub_tasks: [],
    suggested_window: `${template.default_window_days} day${template.default_window_days === 1 ? "" : "s"}`,
    expires_at: expiresAt.toISOString(),
    status: "suggested" as const,
  };
}
