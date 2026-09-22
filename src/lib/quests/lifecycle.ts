import type { createClient } from "@/lib/supabase/server";
import type { Founder, Quest, QuestTemplate } from "@/types/database";
import { pickTemplate, templateToQuestFields } from "./select-template";

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

  const usedTemplateIds = occupyingRows
    .map((q) => q.template_id)
    .filter((id): id is string => Boolean(id));

  while (slotsOpen > 0) {
    const template = pickTemplate(founder, templates, usedTemplateIds);
    if (!template) break;

    usedTemplateIds.push(template.id);
    await supabase.from("quests").insert({
      founder_id: founder.id,
      ...templateToQuestFields(template),
    });
    slotsOpen -= 1;
  }
}

export async function refreshQuestLog(supabase: SupabaseServerClient, founder: Founder) {
  await applyExpiry(supabase, founder.id);
  await ensureQuestSlots(supabase, founder);
}
