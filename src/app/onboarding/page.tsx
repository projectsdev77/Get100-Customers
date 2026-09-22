import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: founder } = await supabase
    .from("founders")
    .select("*")
    .eq("auth_user_id", user.id)
    .single<Founder>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <div className="w-full max-w-md">
        <OnboardingWizard founder={founder ?? null} />
      </div>
    </div>
  );
}
