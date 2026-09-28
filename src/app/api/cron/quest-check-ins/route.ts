import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notifications/notify";
import type { Founder, Quest } from "@/types/database";

// Proactive, commitment-specific check-ins — the coach previously only ever
// spoke when a founder loaded a page (runLazyNotificationChecks runs inside
// refreshQuestLog); a founder who stopped opening the app got nothing,
// generic or otherwise. This runs independently on a schedule (same
// zero-budget GitHub Actions pattern as weekly-recap.yml) and follows up on
// one specific quest by name, not a generic "come back" nudge.
//
// activated_at (not created_at/expires_at) is the reference point, since a
// quest's window is computed from when it was *suggested*, not when the
// founder actually accepted it — created_at would understate how long
// they've genuinely been sitting on it if it waited a while as a
// suggestion first. check_in_sent dedupes so each quest gets at most one
// nudge, regardless of how often this route runs.
const CHECK_IN_DELAY_HOURS = 48;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const cutoffIso = new Date(Date.now() - CHECK_IN_DELAY_HOURS * 60 * 60 * 1000).toISOString();

  const { data: dueQuests } = await admin
    .from("quests")
    .select("id, founder_id, title")
    .eq("status", "active")
    .eq("check_in_sent", false)
    .not("activated_at", "is", null)
    .lte("activated_at", cutoffIso)
    .returns<Pick<Quest, "id" | "founder_id" | "title">[]>();

  let sent = 0;

  for (const quest of dueQuests ?? []) {
    const { data: founder } = await admin
      .from("founders")
      .select("id, name")
      .eq("id", quest.founder_id)
      .single<Pick<Founder, "id" | "name">>();
    if (!founder) continue;

    await notify(
      founder.id,
      "quest_check_in",
      `Still working on "${quest.title}"? Let your coach know if you want help or a different approach.`,
      {
        emailSubject: `How's "${quest.title}" going?`,
        emailHtml: `<p>It's been a couple of days since you started "<strong>${quest.title}</strong>." How's it going?</p><p>If you're stuck, need a different approach, or just haven't had time — open the coach chat in the app and we can figure out the next move together.</p>`,
      },
    );

    await admin.from("quests").update({ check_in_sent: true }).eq("id", quest.id);
    sent += 1;
  }

  return NextResponse.json({ sent, checked: dueQuests?.length ?? 0 });
}
