import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";
import { refreshQuestLog, OCCUPYING_STATUSES } from "@/lib/quests/lifecycle";
import { logCustomer } from "./actions";
import { isoDaysAgo } from "@/lib/utils/days-remaining";
import { GrowthHud } from "@/components/ui/game/GrowthHud";
import { Card } from "@/components/ui/surfaces/Card";
import { Button, LinkButton } from "@/components/ui/actions/Button";

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

  const weekAgoIso = isoDaysAgo(7);
  const [{ data: weekEvents }, { count: questCount }] = await Promise.all([
    supabase
      .from("customer_events")
      .select("delta")
      .eq("founder_id", founder.id)
      .gte("reported_at", weekAgoIso)
      .returns<{ delta: number }[]>(),
    supabase
      .from("quests")
      .select("id", { count: "exact", head: true })
      .eq("founder_id", founder.id)
      .in("status", OCCUPYING_STATUSES),
  ]);
  const weekDelta = (weekEvents ?? []).reduce((sum, e) => sum + e.delta, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
        Welcome{founder.name ? `, ${founder.name}` : ""}
      </h1>

      <div className="grid grid-cols-1 items-start gap-6 min-[860px]:grid-cols-[1fr_320px]">
        <GrowthHud
          customers={founder.current_customer_count}
          weekDelta={weekDelta !== 0 ? weekDelta : null}
          level={founder.level}
          xp={founder.xp}
          streak={founder.streak_count}
        />

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 p-5">
            <h2 className="text-base font-medium text-primary">Log progress</h2>
            <form action={logCustomer}>
              <Button type="submit" fullWidth size="sm">
                + I got a new customer
              </Button>
            </form>
            <LinkButton href="/settings" variant="outline" size="sm">
              Correct your count →
            </LinkButton>
          </Card>

          <Card className="flex flex-col gap-3 p-5">
            <h2 className="text-base font-medium text-primary">Your quests</h2>
            <p className="text-sm text-secondary">
              {questCount ?? 0} quest{questCount === 1 ? "" : "s"} in your log right now.
            </p>
            <LinkButton href="/quests" variant="outline" size="sm">
              View your quests →
            </LinkButton>
          </Card>
        </div>
      </div>
    </div>
  );
}
