import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Founder, Quest } from "@/types/database";
import {
  refreshQuestLog,
  getGrowthProfile,
  getRecentQuestHistory,
  OCCUPYING_STATUSES,
} from "@/lib/quests/lifecycle";
import { logCustomer, startFirstSuggestedQuest } from "./actions";
import { markQuestDone, skipQuest } from "../quests/actions";
import { QuestSteps } from "../quests/quest-steps";
import { QuestWriting } from "../quests/quest-writing";
import { isoDaysAgo } from "@/lib/utils/days-remaining";
import { detectSkipPattern } from "@/lib/growth-profile/patterns";
import { STAGE_LABELS } from "@/lib/founders/field-options";
import { GrowthHud } from "@/components/ui/game/GrowthHud";
import { GrowthInsights } from "@/components/ui/game/GrowthInsights";
import { QuestCard } from "@/components/ui/quests/QuestCard";
import { Card } from "@/components/ui/surfaces/Card";
import { Button } from "@/components/ui/actions/Button";
import { EditCountToggle } from "./edit-count-toggle";
import { CelebrationSnapshot } from "@/components/celebrations/CelebrationSnapshot";
import { HeroWelcomeIllustration } from "@/components/celebrations/HeroWelcomeIllustration";
import { DecorativeImage } from "@/components/celebrations/DecorativeImage";
import { ILLUSTRATIONS } from "@/lib/celebrations/illustrations";
import { CELEBRATIONS_ENABLED } from "@/lib/celebrations/flag";

// Room for the background "Next up" refill (after() in ensureQuestSlots)
// to finish an AI call that can take 10-20 seconds.
export const maxDuration = 60;

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
  const suggestedQuests = occupyingQuests.filter((q) => q.status === "suggested");
  const questCount = occupyingQuests.length;
  const isNewUser = founder.current_customer_count === 0;
  const firstSuggested = suggestedQuests[0] ?? null;

  const subline = [founder.company_name, founder.stage ? (STAGE_LABELS[founder.stage] ?? founder.stage) : null]
    .filter(Boolean)
    .join(" · ");

  const questsCard = (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="text-base font-medium text-primary">Your quests</h2>
          <p className="text-sm text-secondary">
            {isNewUser
              ? "Pick one to get started."
              : `${questCount} quest${questCount === 1 ? "" : "s"} in your log right now.`}
          </p>
        </div>
        {CELEBRATIONS_ENABLED && (
          <DecorativeImage
            src={ILLUSTRATIONS.spotQuest}
            className="h-[116px] w-[128px] min-w-0 max-w-[40%] shrink object-contain"
          />
        )}
      </div>
      {isNewUser ? (
        <>
          {suggestedQuests.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {suggestedQuests.slice(0, 3).map((quest) => (
                <div key={quest.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-quest-suggested-ink" />
                  <span className="min-w-0 flex-1 truncate text-sm text-primary">{quest.title}</span>
                  <span className="shrink-0 text-xs text-secondary">+{quest.xp_value} XP</span>
                </div>
              ))}
            </div>
          )}
          {firstSuggested ? (
            <form action={startFirstSuggestedQuest.bind(null, firstSuggested.id)}>
              <Button type="submit" fullWidth size="sm">
                Start your first quest
              </Button>
            </form>
          ) : (
            <QuestWriting message="Your coach is writing your first quest…" />
          )}
        </>
      ) : (
        <>
          <Link href="/quests" className="text-sm font-medium text-accent">
            View your quests →
          </Link>
        </>
      )}
    </Card>
  );

  const logProgressCard = (
    <Card className="flex flex-col gap-3 p-5">
      <EditCountToggle
        currentCount={founder.current_customer_count}
        icon={
          CELEBRATIONS_ENABLED && (
            <DecorativeImage
              src={ILLUSTRATIONS.spotJournal}
              className="h-[104px] w-[128px] min-w-0 max-w-[40%] shrink object-contain"
            />
          )
        }
      />
      <form action={logCustomer}>
        <Button type="submit" variant={isNewUser ? "secondary" : "primary"} fullWidth size="sm">
          + I got a new customer
        </Button>
      </form>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <CelebrationSnapshot
        xp={founder.xp}
        level={founder.level}
        customers={founder.current_customer_count}
        founderName={founder.name}
      />
      {CELEBRATIONS_ENABLED ? (
        <div className="hero-welcome-banner mt-[60px] flex min-h-[140px] items-center gap-4 rounded-[24px] py-0 pl-9 pr-6 max-[600px]:mt-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(22px,3.4vw,30px)] font-medium leading-[1.15] tracking-[-0.01em] text-white">
              Welcome{founder.name ? `, ${founder.name}` : ""}
            </h1>
            {subline && <p className="text-sm text-white">{subline}</p>}
          </div>
          <HeroWelcomeIllustration
            founderId={founder.id}
            className="h-[210px] max-w-[46%] shrink min-w-0 -mt-[70px] mr-[6%] self-end object-contain object-bottom max-[600px]:hidden"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
            Welcome{founder.name ? `, ${founder.name}` : ""}
          </h1>
          {subline && <p className="text-sm text-secondary">{subline}</p>}
        </div>
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
          {isNewUser ? (
            <>
              {questsCard}
              {logProgressCard}
            </>
          ) : (
            <>
              {logProgressCard}
              {questsCard}
            </>
          )}
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
            <Link href="/quests" className="text-sm font-medium text-accent">
              Accept a quest →
            </Link>
          </div>
        )}
        {activeQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            status={quest.status}
            title={quest.title}
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
          >
            <QuestSteps quest={quest} />
          </QuestCard>
        ))}
      </section>

      <GrowthInsights growth={growth} pattern={skipPattern} />
    </div>
  );
}
