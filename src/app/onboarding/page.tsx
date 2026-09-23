import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";
import { OnboardingWizard } from "./onboarding-wizard";
import { Card } from "@/components/ui/surfaces/Card";

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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-md p-8">
        <OnboardingWizard founder={founder ?? null} />
      </Card>
    </div>
  );
}
