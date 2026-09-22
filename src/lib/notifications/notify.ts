import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import type { EmailNotificationPrefs, NotificationType } from "@/types/database";

interface NotifyOptions {
  emailSubject?: string;
  emailHtml?: string;
}

// Single entry point for every notification trigger in SPEC §11 (new
// quest, window approaching, re-engagement, milestones, weekly recap).
// Always logs in-app; additionally emails when the founder's preference
// for this type isn't explicitly off. Runs on the admin client since
// notifications are system-generated, not founder-authored writes (see
// supabase/schema.sql's notifications_log RLS comment).
export async function notify(
  founderId: string,
  type: NotificationType,
  inAppMessage: string,
  options: NotifyOptions = {},
): Promise<void> {
  const admin = createAdminClient();

  await admin.from("notifications_log").insert({
    founder_id: founderId,
    type,
    channel: "in_app",
    message: inAppMessage,
  });

  if (!options.emailSubject || !options.emailHtml) return;

  const { data: founder } = await admin
    .from("founders")
    .select("auth_user_id, email_notification_prefs")
    .eq("id", founderId)
    .single<{ auth_user_id: string; email_notification_prefs: EmailNotificationPrefs }>();
  if (!founder) return;
  if (founder.email_notification_prefs?.[type] === false) return;

  const { data: authUser } = await admin.auth.admin.getUserById(founder.auth_user_id);
  const email = authUser?.user?.email;
  if (!email) return;

  const sent = await sendEmail(email, options.emailSubject, options.emailHtml);
  if (sent) {
    await admin.from("notifications_log").insert({
      founder_id: founderId,
      type,
      channel: "email",
      message: options.emailSubject,
    });
  }
}

// Dedupe helper — checks whether a notification of this type already
// fired within `withinHours`, so lazily-checked triggers (window
// approaching, re-engagement) don't spam on every page load.
export async function hasRecentNotification(
  founderId: string,
  type: NotificationType,
  withinHours: number,
): Promise<boolean> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString();

  const { count } = await admin
    .from("notifications_log")
    .select("id", { count: "exact", head: true })
    .eq("founder_id", founderId)
    .eq("type", type)
    .gte("sent_at", since);

  return (count ?? 0) > 0;
}
