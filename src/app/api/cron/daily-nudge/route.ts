import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notifications/notify";
import {
  NUDGE_WINDOW_HOURS,
  buildNudgeContext,
  buildNudgeEmailHtml,
  fallbackNudge,
  selectNudges,
  writeNudgeWithAI,
  type NudgeQuest,
} from "@/lib/notifications/daily-nudge";
import type { Founder } from "@/types/database";

// Triggered each morning by .github/workflows/daily-nudge.yml (same
// zero-budget pattern as the other crons). Emails founders whose active
// quest hasn't moved in a day and logs the same message to their
// Notifications tab via notify().
export const maxDuration = 60;

// Each AI call is capped so one slow provider response can't stall the
// whole batch; a founder whose call times out gets the template instead.
const AI_TIMEOUT_MS = 8_000;
const CONCURRENCY = 5;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

export async function POST(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const sinceIso = new Date(now - NUDGE_WINDOW_HOURS * 3_600_000).toISOString();

  const { data: activeQuests } = await admin
    .from("quests")
    .select("id, founder_id, title, sub_tasks, instructions, expires_at, activated_at, last_progress_at")
    .in("status", ["active", "in_progress"])
    .returns<NudgeQuest[]>();
  const quests = activeQuests ?? [];
  const founderIds = [...new Set(quests.map((q) => q.founder_id))];
  if (founderIds.length === 0) return NextResponse.json({ sent: 0, checked: 0 });

  const [customers, reports, completed, subscriptions, notifications] = await Promise.all([
    admin.from("customer_events").select("founder_id").in("founder_id", founderIds).gte("reported_at", sinceIso),
    admin.from("quest_results").select("founder_id").in("founder_id", founderIds).gte("reported_at", sinceIso),
    admin.from("quests").select("founder_id").in("founder_id", founderIds).gte("completed_at", sinceIso),
    admin.from("subscriptions").select("founder_id, status").in("founder_id", founderIds),
    admin
      .from("notifications_log")
      .select("founder_id, type, sent_at")
      .in("founder_id", founderIds)
      .in("type", ["daily_nudge", "quest_check_in", "re_engagement"])
      .gte("sent_at", sinceIso),
  ]);

  const recentlyProgressed = new Set(
    [...(customers.data ?? []), ...(reports.data ?? []), ...(completed.data ?? [])].map(
      (row: { founder_id: string }) => row.founder_id,
    ),
  );
  const restricted = new Set(
    (subscriptions.data ?? [])
      .filter((s: { status: string }) => s.status === "restricted")
      .map((s: { founder_id: string }) => s.founder_id),
  );

  const toNudge = selectNudges(
    quests,
    { recentlyProgressed, restricted, recentNotifications: notifications.data ?? [] },
    now,
  );
  if (toNudge.length === 0) return NextResponse.json({ sent: 0, checked: founderIds.length });

  const { data: founderRows } = await admin
    .from("founders")
    .select("id, name, company_name, current_customer_count")
    .in(
      "id",
      toNudge.map((q) => q.founder_id),
    )
    .returns<Pick<Founder, "id" | "name" | "company_name" | "current_customer_count">[]>();
  const founders = new Map((founderRows ?? []).map((f) => [f.id, f]));

  let sent = 0;
  let aiWritten = 0;

  async function nudge(quest: NudgeQuest) {
    const founder = founders.get(quest.founder_id);
    if (!founder) return;
    const context = buildNudgeContext(quest, founder, now);
    const aiCopy = await withTimeout(writeNudgeWithAI(context), AI_TIMEOUT_MS);
    const copy = aiCopy ?? fallbackNudge(context);
    if (aiCopy) aiWritten += 1;

    const questUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quests#quest-${quest.id}`;
    await notify(founder.id, "daily_nudge", copy.body, {
      emailSubject: copy.subject,
      emailHtml: buildNudgeEmailHtml(copy, context, questUrl),
      questId: quest.id,
    });
    sent += 1;
  }

  for (let i = 0; i < toNudge.length; i += CONCURRENCY) {
    await Promise.all(toNudge.slice(i, i + CONCURRENCY).map(nudge));
  }

  return NextResponse.json({ sent, aiWritten, checked: founderIds.length });
}
