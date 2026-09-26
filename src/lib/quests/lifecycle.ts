import type { createClient } from "@/lib/supabase/server";
import type { Founder, GrowthProfile, Quest, QuestTemplate } from "@/types/database";
import { pickTemplate, templateToQuestFields } from "./select-template";
import { personalizeQuestWithAI } from "@/lib/ai/personalize-quest";
import { generateNetNewQuest } from "@/lib/ai/generate-quest";
import { selectNextQuestWithAI } from "@/lib/ai/select-quest";
import { notify } from "@/lib/notifications/notify";
import { runLazyNotificationChecks } from "@/lib/notifications/lazy-checks";
import { applySubscriptionLifecycle, getSubscription, isRestricted } from "@/lib/subscriptions/status";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Statuses considered "in flight" for template-exclusion purposes (never
// suggest a template that's already active/suggested/awaiting report) —
// only completed/skipped/expired are free to reuse. This is a separate
// concept from the active-quest cap below: it's about not repeating a
// template, not about capacity.
export const OCCUPYING_STATUSES = ["suggested", "active", "in_progress", "awaiting_report"];

// Design handoff: "Active (N of 3)" caps ACTIVE quests specifically —
// accept is blocked past 3, with its own flash message — while a single
// "next up" suggestion and any "awaiting report" quests sit outside that
// cap and can coexist with it (SPEC gap resolved 2026-09-23, superseding
// the earlier shared-pool-of-3 model).
export const MAX_ACTIVE_QUESTS = 3;
const MAX_SUGGESTED_QUESTS = 1;
const ACTIVE_STATUSES = ["active", "in_progress"];

// Flips any occupying quest whose soft deadline has passed to 'expired'
// (SPEC §7.3). No cron job needed for a zero-budget build — this runs
// lazily whenever quests are fetched (PHASES.md Phase 3).
export async function applyExpiry(supabase: SupabaseServerClient, founderId: string) {
  const nowIso = new Date().toISOString();
  await supabase
    .from("quests")
    .update({ status: "expired", resolved_at: nowIso })
    .eq("founder_id", founderId)
    .in("status", OCCUPYING_STATUSES)
    .lt("expires_at", nowIso);
}

export async function getGrowthProfile(
  supabase: SupabaseServerClient,
  founderId: string,
): Promise<GrowthProfile | null> {
  const { data } = await supabase
    .from("growth_profiles")
    .select("*")
    .eq("founder_id", founderId)
    .single<GrowthProfile>();
  return data ?? null;
}

// Quest builder (SPEC §7.1). The AI chooses the quest itself — channel and
// all — grounded in the founder's growth history and the template library
// only as a style/shape reference (see select-quest.ts for why this
// replaces select-template.ts's old random-among-eligible ranking). If that
// call fails or its output fails the guardrails, this falls back to
// exactly the previous behavior: a template picked by the deterministic
// rule-based ranking, personalized by AI (or used raw if that also fails);
// when no template is eligible at all, a net-new quest. Every tier here can
// fail independently without quest generation ever breaking (SPEC §17).
export async function buildQuestInsertFields(
  founder: Founder,
  growth: GrowthProfile | null,
  templates: QuestTemplate[],
  excludeTemplateIds: string[],
  recentCategories: string[] = [],
  recentTitles: string[] = [],
) {
  const aiSelected = await selectNextQuestWithAI(
    founder,
    growth,
    templates,
    recentCategories,
    recentTitles,
  );
  if (aiSelected) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + aiSelected.window_days);

    return {
      fields: {
        template_id: null,
        title: aiSelected.title,
        description: null,
        instructions: aiSelected.instructions,
        category: aiSelected.category,
        xp_value: aiSelected.xp_value,
        reasoning: aiSelected.reasoning,
        tools_provided: aiSelected.tools_provided,
        result_questions: aiSelected.result_questions,
        success_criteria: null,
        sub_tasks: [],
        suggested_window: `${aiSelected.window_days} day${aiSelected.window_days === 1 ? "" : "s"}`,
        expires_at: expiresAt.toISOString(),
        status: "suggested" as const,
      },
      usedTemplateId: null,
    };
  }

  const template = pickTemplate(founder, templates, excludeTemplateIds);

  if (template) {
    const base = templateToQuestFields(template, founder);
    const personalized = await personalizeQuestWithAI(founder, growth, template);
    return {
      fields: personalized
        ? {
            ...base,
            title: personalized.title,
            instructions: personalized.instructions,
            tools_provided: personalized.tools_provided,
            reasoning: personalized.reasoning,
          }
        : base,
      usedTemplateId: template.id as string | null,
    };
  }

  const generated = await generateNetNewQuest(founder, growth);
  if (!generated) return null;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + generated.window_days);

  return {
    fields: {
      template_id: null,
      title: generated.title,
      description: null,
      instructions: generated.instructions,
      category: generated.category,
      xp_value: generated.xp_value,
      reasoning: generated.reasoning,
      tools_provided: generated.tools_provided,
      result_questions: generated.result_questions,
      success_criteria: null,
      sub_tasks: [],
      suggested_window: `${generated.window_days} day${generated.window_days === 1 ? "" : "s"}`,
      expires_at: expiresAt.toISOString(),
      status: "suggested" as const,
    },
    usedTemplateId: null,
  };
}

// Tops up to one pending "next up" suggestion, independent of the active
// count (design handoff — a suggestion should always be waiting, but
// accepting it is what's gated by the active-quest cap, not generating
// it). Called after any action that might have resolved the current
// suggestion or freed an active slot.
export async function ensureQuestSlots(
  supabase: SupabaseServerClient,
  founder: Founder,
): Promise<void> {
  // Restricted accounts (trial/grace period expired with no payment, SPEC
  // §3) can still view their existing quest log — they just stop getting
  // new ones until payment is resolved.
  const subscription = await getSubscription(supabase, founder.id);
  if (isRestricted(subscription)) return;

  const { data: occupying } = await supabase
    .from("quests")
    .select("id, template_id, status, category, title")
    .eq("founder_id", founder.id)
    .in("status", OCCUPYING_STATUSES)
    .returns<Pick<Quest, "id" | "template_id" | "status" | "category" | "title">[]>();

  const occupyingRows = occupying ?? [];
  const suggestedCount = occupyingRows.filter((q) => q.status === "suggested").length;
  if (suggestedCount >= MAX_SUGGESTED_QUESTS) return;

  const { data: templates } = await supabase
    .from("quest_templates")
    .select("*")
    .returns<QuestTemplate[]>();
  if (!templates || templates.length === 0) return;

  const growth = await getGrowthProfile(supabase, founder.id);
  const usedTemplateIds = occupyingRows
    .map((q) => q.template_id)
    .filter((id): id is string => Boolean(id));
  const recentCategories = occupyingRows
    .map((q) => q.category)
    .filter((c): c is string => Boolean(c));
  const recentTitles = occupyingRows.map((q) => q.title);

  const built = await buildQuestInsertFields(
    founder,
    growth,
    templates,
    usedTemplateIds,
    recentCategories,
    recentTitles,
  );
  if (!built) return;

  await supabase.from("quests").insert({
    founder_id: founder.id,
    ...built.fields,
  });

  // In-app only (SPEC §11) — the founder is typically already in the app
  // when a suggestion refills.
  await notify(founder.id, "new_quest", `New quest: ${built.fields.title}`);
}

// Used by acceptQuest to enforce the "3 active" cap (design handoff)
// before a suggested → active transition.
export async function countActiveQuests(
  supabase: SupabaseServerClient,
  founderId: string,
): Promise<number> {
  const { count } = await supabase
    .from("quests")
    .select("id", { count: "exact", head: true })
    .eq("founder_id", founderId)
    .in("status", ACTIVE_STATUSES);
  return count ?? 0;
}

export async function refreshQuestLog(supabase: SupabaseServerClient, founder: Founder) {
  await applySubscriptionLifecycle(founder.id);
  await applyExpiry(supabase, founder.id);
  await ensureQuestSlots(supabase, founder);
  await runLazyNotificationChecks(supabase, founder);
}
