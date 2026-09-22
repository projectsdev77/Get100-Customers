import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";
import { ProfileForm } from "./profile-form";

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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Profile settings</h1>
      <ProfileForm founder={founder ?? null} />
    </div>
  );
}
