"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { OCCUPYING_STATUSES, refreshQuestLog } from "@/lib/quests/lifecycle";
import { pickTemplate, templateToQuestFields } from "@/lib/quests/select-template";
import type { Quest, QuestTemplate } from "@/types/database";

// Suggested → active (SPEC §7.3/§7.4).
export async function acceptQuest(questId: string) {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase
    .from("quests")
    .update({ status: "active" })
    .eq("id", questId)
    .eq("founder_id", founder.id)
    .eq("status", "suggested");

  revalidatePath("/quests");
}

// "Not for me" — first-class growth-profile signal, not just a dismissal
// (SPEC §7.4), works from 'suggested' or 'active'.
export async function skipQuest(formData: FormData) {
  const questId = String(formData.get("questId"));
  const reason = String(formData.get("reason") || "") || null;

  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase
    .from("quests")
    .update({
      status: "skipped",
      skip_reason: reason,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", questId)
    .eq("founder_id", founder.id);

  await refreshQuestLog(supabase, founder);
  revalidatePath("/quests");
}

// "Show other options" — swaps the pending suggestion for a different
// template. No decision was made, so the old row is deleted rather than
// recorded as a skip (SPEC §7.4).
export async function regenerateQuest(questId: string) {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  const { data: existing } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("founder_id", founder.id)
    .eq("status", "suggested")
    .single<Quest>();
  if (!existing) return;

  const { data: occupying } = await supabase
    .from("quests")
    .select("template_id")
    .eq("founder_id", founder.id)
    .in("status", OCCUPYING_STATUSES)
    .returns<Pick<Quest, "template_id">[]>();

  const excludeIds = [
    ...(occupying ?? []).map((q) => q.template_id),
    existing.template_id,
  ].filter((id): id is string => Boolean(id));

  const { data: templates } = await supabase
    .from("quest_templates")
    .select("*")
    .returns<QuestTemplate[]>();

  const template = pickTemplate(founder, templates ?? [], excludeIds);
  if (!template) return;

  await supabase.from("quests").delete().eq("id", questId);
  await supabase.from("quests").insert({
    founder_id: founder.id,
    ...templateToQuestFields(template),
  });

  revalidatePath("/quests");
}

// Active → awaiting_report. Structured result questions (SPEC §8) land in
// Phase 4 — this just marks it done for now.
export async function markQuestDone(questId: string) {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase
    .from("quests")
    .update({ status: "awaiting_report" })
    .eq("id", questId)
    .eq("founder_id", founder.id)
    .eq("status", "active");

  revalidatePath("/quests");
}
