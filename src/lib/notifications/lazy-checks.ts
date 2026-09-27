import type { createClient } from "@/lib/supabase/server";
import type { Founder, Quest } from "@/types/database";
import { hasRecentNotification, notify } from "./notify";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const WINDOW_APPROACHING_HOURS = 24;
const REENGAGEMENT_INACTIVITY_DAYS = 5;

// window_approaching and re_engagement (SPEC §11) have no natural
// "something happened" trigger the way new_quest/milestone do, and a
// zero-budget build has no per-minute cron. Instead these run lazily on
// every founder-facing page load (see refreshQuestLog), deduped via
// hasRecentNotification so they fire at most once per window.
export async function runLazyNotificationChecks(
  supabase: SupabaseServerClient,
  founder: Founder,
): Promise<void> {
  const { data: active } = await supabase
    .from("quests")
    .select("id, title, expires_at")
    .eq("founder_id", founder.id)
    .eq("status", "active")
    .returns<Pick<Quest, "id" | "title" | "expires_at">[]>();

  const soonCutoff = Date.now() + WINDOW_APPROACHING_HOURS * 60 * 60 * 1000;
  const dueSoon = (active ?? []).find((q) => q.expires_at && new Date(q.expires_at).getTime() <= soonCutoff);

  if (dueSoon && !(await hasRecentNotification(founder.id, "window_approaching", 24))) {
    await notify(founder.id, "window_approaching", `Your quest "${dueSoon.title}" is due soon.`, {
      emailSubject: "A quest is due soon",
      emailHtml: `<p>Your quest "<strong>${dueSoon.title}</strong>" is due soon. Don't lose your streak!</p>`,
    });
  }

  if (!founder.last_streak_activity_at) return;
  const { data: occupying } = await supabase
    .from("quests")
    .select("id")
    .eq("founder_id", founder.id)
    .in("status", ["suggested", "active", "in_progress", "awaiting_report"]);
  if (!occupying || occupying.length === 0) return;

  const daysSinceActive =
    (Date.now() - new Date(founder.last_streak_activity_at).getTime()) / 86_400_000;
  if (daysSinceActive < REENGAGEMENT_INACTIVITY_DAYS) return;

  const alreadyNudged = await hasRecentNotification(
    founder.id,
    "re_engagement",
    24 * REENGAGEMENT_INACTIVITY_DAYS,
  );
  if (alreadyNudged) return;

  await notify(founder.id, "re_engagement", "Your quest is still open. Need a hand?", {
    emailSubject: "Still there? Your quest is waiting",
    emailHtml: "<p>You've got an open quest waiting. Need a hand getting started?</p>",
  });
}
