import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: founder } = await supabase
    .from("founders")
    .select("*")
    .eq("auth_user_id", user!.id)
    .single<Founder>();

  const profileComplete = Boolean(founder?.industry && founder?.product_description);

  if (!profileComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Welcome{founder?.name ? `, ${founder.name}` : ""}
      </h1>

      <div className="rounded border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Progress</p>
        <p className="text-3xl font-semibold text-black dark:text-zinc-50">
          {founder?.current_customer_count ?? 0} / 100 customers
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Full XP/levels/streak gamification lands in a later build phase (see PHASES.md Phase 6).
        </p>
      </div>

      <Link
        href="/quests"
        className="rounded bg-black px-4 py-3 text-center text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
      >
        View your quests →
      </Link>
    </div>
  );
}
