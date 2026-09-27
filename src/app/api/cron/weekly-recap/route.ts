import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notifications/notify";
import type { Founder } from "@/types/database";

// Weekly progress recap (SPEC §11). No paid cron infra — this route is
// triggered by a scheduled GitHub Actions workflow
// (.github/workflows/weekly-recap.yml), which is free on both public and
// (within the monthly minutes allowance) private repos. Auth is a shared
// secret rather than a user session, since nothing is logged in here.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: founders } = await admin.from("founders").select("*").returns<Founder[]>();

  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let sent = 0;

  for (const founder of founders ?? []) {
    const { count: questsCompleted } = await admin
      .from("quests")
      .select("id", { count: "exact", head: true })
      .eq("founder_id", founder.id)
      .eq("status", "completed")
      .gte("completed_at", weekAgoIso);

    const { data: customerEvents } = await admin
      .from("customer_events")
      .select("delta")
      .eq("founder_id", founder.id)
      .gte("reported_at", weekAgoIso)
      .returns<{ delta: number }[]>();

    const customersThisWeek = (customerEvents ?? []).reduce((sum, e) => sum + e.delta, 0);

    // Silent founders get the re-engagement nudge (lazy-checks.ts) instead
    // of an empty recap.
    if ((questsCompleted ?? 0) === 0 && customersThisWeek === 0) continue;

    await notify(
      founder.id,
      "weekly_recap",
      `This week: ${questsCompleted ?? 0} quests completed, ${customersThisWeek >= 0 ? "+" : ""}${customersThisWeek} customers. You're at ${founder.current_customer_count}/100.`,
      {
        emailSubject: "Your weekly growth recap",
        emailHtml: `<p>This week you completed <strong>${questsCompleted ?? 0}</strong> quest${questsCompleted === 1 ? "" : "s"} and gained <strong>${customersThisWeek}</strong> customer${customersThisWeek === 1 ? "" : "s"}.</p><p>You're now at <strong>${founder.current_customer_count}/100</strong>.</p>`,
      },
    );
    sent += 1;
  }

  return NextResponse.json({ sent, checked: founders?.length ?? 0 });
}
