import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";
import { refreshQuestLog } from "@/lib/quests/lifecycle";
import { correctCustomerCount, logCustomer } from "./actions";
import { GrowthHud } from "./growth-hud";

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

  if (!profileComplete || !founder) {
    redirect("/onboarding");
  }

  await refreshQuestLog(supabase, founder);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Welcome{founder.name ? `, ${founder.name}` : ""}
      </h1>

      <GrowthHud founder={founder} />

      <div className="flex flex-wrap items-center gap-3">
        <form action={logCustomer}>
          <button
            type="submit"
            className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-zinc-50 dark:text-black"
          >
            + I got a new customer
          </button>
        </form>

        <form action={correctCustomerCount} className="flex items-center gap-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">Correct count:</label>
          <input
            type="number"
            name="count"
            min={0}
            defaultValue={founder.current_customer_count}
            className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
          >
            Save
          </button>
        </form>
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
