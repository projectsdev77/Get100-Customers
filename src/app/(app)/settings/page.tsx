import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";
import { ProfileForm } from "./profile-form";
import { NotificationPrefsForm } from "./notification-prefs-form";

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Profile settings</h1>
        <ProfileForm founder={founder ?? null} />
      </div>

      <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Notifications</h2>
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
      </div>
    </div>
  );
}
