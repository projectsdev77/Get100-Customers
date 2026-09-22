import type { createClient } from "@/lib/supabase/server";
import type { Founder, GrowthProfile, Quest, QuestTemplate } from "@/types/database";
import { pickTemplate, templateToQuestFields } from "./select-template";
import { personalizeQuestWithAI } from "@/lib/ai/personalize-quest";
import { generateNetNewQuest } from "@/lib/ai/generate-quest";
import { notify } from "@/lib/notifications/notify";
import { runLazyNotificationChecks } from "@/lib/notifications/lazy-checks";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Statuses that occupy one of the founder's 3 concurrent quest slots
// (SPEC §7.3) — only completed/skipped/expired free a slot.
export const OCCUPYING_STATUSES = ["suggested", "active", "in_progress", "awaiting_report"];
const MAX_CONCURRENT_QUESTS = 3;

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

// The hybrid template+AI quest builder (SPEC §7.1). Picks a template via
// the rule-based ranking (§select-template) and asks Gemini to personalize
// it; falls back to the raw template on any AI failure or guardrail
// rejection (SPEC §17 — never show broken output). When no template is
// eligible at all, generates a net-new quest instead.
export async function buildQuestInsertFields(
  founder: Founder,
  growth: GrowthProfile | null,
  templates: QuestTemplate[],
  excludeTemplateIds: string[],
) {
  const template = pickTemplate(founder, templates, excludeTemplateIds);

  if (template) {
    const base = templateToQuestFields(template);
    const personalized = await personalizeQuestWithAI(founder, growth, template);
    return {
      fields: personalized
        ? { ...base, title: personalized.title, instructions: personalized.instructions, tools_provided: personalized.tools_provided }
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

// Tops up suggested quests until (active + suggested + …) reaches the cap
// (SPEC §7.4 — "when a slot opens, the AI recommends one primary next
// quest"). Called after any action that might have freed a slot.
export async function ensureQuestSlots(
  supabase: SupabaseServerClient,
  founder: Founder,
): Promise<void> {
  const { data: occupying } = await supabase
    .from("quests")
    .select("id, template_id")
    .eq("founder_id", founder.id)
    .in("status", OCCUPYING_STATUSES)
    .returns<Pick<Quest, "id" | "template_id">[]>();

  const occupyingRows = occupying ?? [];
  let slotsOpen = MAX_CONCURRENT_QUESTS - occupyingRows.length;
  if (slotsOpen <= 0) return;

  const { data: templates } = await supabase
    .from("quest_templates")
    .select("*")
    .returns<QuestTemplate[]>();
  if (!templates || templates.length === 0) return;

  const growth = await getGrowthProfile(supabase, founder.id);
  const usedTemplateIds = occupyingRows
    .map((q) => q.template_id)
    .filter((id): id is string => Boolean(id));

  while (slotsOpen > 0) {
    const built = await buildQuestInsertFields(founder, growth, templates, usedTemplateIds);
    if (!built) break;

    if (built.usedTemplateId) usedTemplateIds.push(built.usedTemplateId);
    await supabase.from("quests").insert({
      founder_id: founder.id,
      ...built.fields,
    });
    slotsOpen -= 1;

    // In-app only (SPEC §11) — the founder is typically already in the app
    // when a slot refills, and 3 of these can fire right after onboarding.
    await notify(founder.id, "new_quest", `New quest: ${built.fields.title}`);
  }
}

export async function refreshQuestLog(supabase: SupabaseServerClient, founder: Founder) {
  await applyExpiry(supabase, founder.id);
  await ensureQuestSlots(supabase, founder);
  await runLazyNotificationChecks(supabase, founder);
}
