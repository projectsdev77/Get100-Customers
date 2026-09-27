import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { hasIdentityProvider } from "@/lib/auth/find-user-by-email";
import { ProfileForm } from "./profile-form";
import { CustomerCountForm } from "./customer-count-form";
import { AccountForm } from "./account-form";
import { BillingSection } from "./billing-section";
import { NotificationPrefsForm } from "./notification-prefs-form";
import { DangerZone } from "./danger-zone";
import { SettingsTabs, type SettingsSection } from "./settings-tabs";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const founder = await getCurrentFounder(supabase);

  const sections: SettingsSection[] = [
    { id: "profile", label: "Business profile", content: <ProfileForm founder={founder} /> },
    ...(founder
      ? [
          {
            id: "customer-count",
            label: "Customer count",
            content: <CustomerCountForm currentCount={founder.current_customer_count} />,
          },
        ]
      : []),
    {
      id: "account",
      label: "Account",
      content: (
        <AccountForm
          email={user.email ?? ""}
          hasPassword={hasIdentityProvider(user, "email")}
          hasGoogle={hasIdentityProvider(user, "google")}
        />
      ),
    },
    ...(founder
      ? [
          {
            id: "billing",
            label: "Billing",
            content: <BillingSection supabase={supabase} founder={founder} />,
          },
        ]
      : []),
    {
      id: "notifications",
      label: "Notifications",
      content: (
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
      ),
    },
    {
      id: "danger",
      label: "Privacy & data",
      content: <DangerZone />,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6">
      <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
        Settings
      </h1>

      <SettingsTabs sections={sections} />
    </div>
  );
}
