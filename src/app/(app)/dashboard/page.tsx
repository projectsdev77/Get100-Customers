import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Founder, Quest } from "@/types/database";
import {
  refreshQuestLog,
  getGrowthProfile,
  getRecentQuestHistory,
  OCCUPYING_STATUSES,
} from "@/lib/quests/lifecycle";
import { logCustomer } from "./actions";
import { markQuestDone, skipQuest } from "../quests/actions";
import { isoDaysAgo } from "@/lib/utils/days-remaining";
import { detectSkipPattern } from "@/lib/growth-profile/patterns";
import { GrowthHud } from "@/components/ui/game/GrowthHud";
import { GrowthInsights } from "@/components/ui/game/GrowthInsights";
import { QuestCard } from "@/components/ui/quests/QuestCard";
import { Card } from "@/components/ui/surfaces/Card";
import { Button, LinkButton } from "@/components/ui/actions/Button";
import { CelebrationSnapshot } from "@/components/celebrations/CelebrationSnapshot";
import { HeroWelcomeIllustration } from "@/components/celebrations/HeroWelcomeIllustration";
import { DecorativeImage } from "@/components/celebrations/DecorativeImage";
import { ILLUSTRATIONS } from "@/lib/celebrations/illustrations";
import { CELEBRATIONS_ENABLED } from "@/lib/celebrations/flag";

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
  const [{ data: weekEvents }, { data: occupying }, growth, recentQuests] = await Promise.all([
    supabase
      .from("customer_events")
      .select("delta")
      .eq("founder_id", founder.id)
      .gte("reported_at", weekAgoIso)
      .returns<{ delta: number }[]>(),
    supabase
      .from("quests")
      .select("*")
      .eq("founder_id", founder.id)
      .in("status", OCCUPYING_STATUSES)
      .returns<Quest[]>(),
    getGrowthProfile(supabase, founder.id),
    getRecentQuestHistory(supabase, founder.id),
  ]);
  const weekDelta = (weekEvents ?? []).reduce((sum, e) => sum + e.delta, 0);
  const skipPattern = detectSkipPattern(recentQuests);
  const occupyingQuests = occupying ?? [];
  const activeQuests = occupyingQuests.filter((q) => q.status === "active" || q.status === "in_progress");
  const questCount = occupyingQuests.length;

  return (
    <div className="flex flex-col gap-6">
      <CelebrationSnapshot
        xp={founder.xp}
        level={founder.level}
        customers={founder.current_customer_count}
        founderName={founder.name}
      />
      {CELEBRATIONS_ENABLED ? (
        <div className="relative mt-10 rounded-panel bg-tile-customers p-7 text-on-tile">
          <h1 className="max-w-[58%] text-3xl font-medium leading-[1.15] tracking-[-0.01em]">
            Welcome{founder.name ? `, ${founder.name}` : ""}
          </h1>
          <HeroWelcomeIllustration className="pointer-events-none absolute -top-10 right-6 h-[calc(100%+40px)] w-[42%] max-w-[240px] object-contain object-bottom" />
        </div>
      ) : (
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
          Welcome{founder.name ? `, ${founder.name}` : ""}
        </h1>
      )}

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
            <LinkButton href="/settings?tab=customer-count" variant="outline" size="sm">
              Correct your count →
            </LinkButton>
          </Card>

          <Card className="flex flex-col gap-3 p-5">
            {CELEBRATIONS_ENABLED && (
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-sunken">
                <DecorativeImage src={ILLUSTRATIONS.spotQuest} className="h-12 w-12 object-contain" />
              </div>
            )}
            <h2 className="text-base font-medium text-primary">Your quests</h2>
            <p className="text-sm text-secondary">
              {questCount} quest{questCount === 1 ? "" : "s"} in your log right now.
            </p>
            <LinkButton href="/quests" variant="outline" size="sm">
              View your quests →
            </LinkButton>
          </Card>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[.06em] text-secondary">
          Active quests
        </h2>
        {activeQuests.length === 0 && (
          <div className="flex flex-col items-start gap-2 rounded-panel border border-dashed border-strong bg-card p-5">
            <p className="text-sm text-secondary">
              No active quest right now. Accept one from your quest log to get started.
            </p>
            <LinkButton href="/quests" variant="outline" size="sm">
              Accept a quest →
            </LinkButton>
          </div>
        )}
        {activeQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            status={quest.status}
            title={quest.title}
            instructions={quest.instructions}
            xp={quest.xp_value}
            window={quest.suggested_window}
            tool={quest.tools_provided[0] ?? null}
            reasoning={quest.reasoning}
            category={quest.category}
            actions={
              <>
                <form action={markQuestDone.bind(null, quest.id)}>
                  <Button type="submit" size="sm">
                    Mark done
                  </Button>
                </form>
                <form action={skipQuest}>
                  <input type="hidden" name="questId" value={quest.id} />
                  <Button type="submit" variant="secondary" size="sm">
                    Skip
                  </Button>
                </form>
              </>
            }
          />
        ))}
      </section>

      <GrowthInsights growth={growth} pattern={skipPattern} />
    </div>
  );
}
