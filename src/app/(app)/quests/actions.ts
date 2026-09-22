"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { OCCUPYING_STATUSES, refreshQuestLog } from "@/lib/quests/lifecycle";
import { pickTemplate, templateToQuestFields } from "@/lib/quests/select-template";
import { recomputeGrowthProfile } from "@/lib/growth-profile/recompute";
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

// Active → awaiting_report. Structured result questions get answered next
// (submitQuestResult below), which is what actually completes the quest.
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

// awaiting_report → completed (SPEC §8). Coerces each answer by the
// question's declared type, stores structured_answers + free-text notes,
// and — since a "converted" boolean is how quests self-report a new
// customer (SPEC §8 manual self-report) — bumps the founder's customer
// count when that answer is true. Free-text AI summarization (ai_summary)
// stays null until Phase 5.
export async function submitQuestResult(formData: FormData) {
  const questId = String(formData.get("questId"));
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  const { data: quest } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("founder_id", founder.id)
    .eq("status", "awaiting_report")
    .single<Quest>();
  if (!quest) return;

  const structuredAnswers: Record<string, string | number | boolean> = {};
  for (const question of quest.result_questions) {
    const raw = formData.get(`answer_${question.id}`);
    if (raw === null) continue;
    if (question.type === "number") {
      structuredAnswers[question.id] = Number(raw) || 0;
    } else if (question.type === "boolean") {
      structuredAnswers[question.id] = raw === "true";
    } else {
      structuredAnswers[question.id] = String(raw);
    }
  }

  const notes = String(formData.get("notes") || "") || null;
  const nowIso = new Date().toISOString();

  await supabase.from("quest_results").insert({
    quest_id: quest.id,
    founder_id: founder.id,
    structured_answers: structuredAnswers,
    notes,
  });

  await supabase
    .from("quests")
    .update({ status: "completed", completed_at: nowIso, resolved_at: nowIso })
    .eq("id", quest.id);

  if (structuredAnswers.converted === true) {
    await supabase.from("customer_events").insert({
      founder_id: founder.id,
      quest_id: quest.id,
      event_type: "reported",
      delta: 1,
      note: `From quest: ${quest.title}`,
    });
    await supabase
      .from("founders")
      .update({ current_customer_count: founder.current_customer_count + 1 })
      .eq("id", founder.id);
  }

  await refreshQuestLog(supabase, founder);
  await recomputeGrowthProfile(supabase, founder.id);

  revalidatePath("/quests");
  revalidatePath("/dashboard");
}
