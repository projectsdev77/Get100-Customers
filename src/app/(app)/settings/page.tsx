import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";
import { ProfileForm } from "./profile-form";
import { NotificationPrefsForm } from "./notification-prefs-form";
import { DangerZone } from "./danger-zone";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: founder } = await supabase
    .from("founders")
    .select("*")
    .eq("auth_user_id", user!.id)
    .single<Founder>();

  return (
    <div className="flex max-w-[560px] flex-col gap-5">
      <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
        Settings
      </h1>

      <ProfileForm founder={founder ?? null} />

      <NotificationPrefsForm
        prefs={
          founder?.email_notification_prefs ?? {
            new_quest: true,
            window_approaching: true,
            re_engagement: true,
            milestone: true,
            weekly_recap: true,
          }
        }
      />

      <DangerZone />
    </div>
  );
}
