import { ProgressRing } from "./ProgressRing";
import { getProgressFloor, getProgressTarget, isInGrowthMode } from "@/lib/gamification/growth-mode";
import { xpIntoCurrentLevel } from "@/lib/gamification/level";

export function GrowthHud({
  customers,
  weekDelta,
  level,
  xp,
  streak,
}: {
  customers: number;
  weekDelta?: number | null;
  level: number;
  xp: number;
  streak: number;
}) {
  const target = getProgressTarget(customers);
  const floor = getProgressFloor(customers);
  const growthMode = isInGrowthMode(customers);
  const xpProgress = xpIntoCurrentLevel(xp);

  return (
    <div className="flex flex-col gap-2 rounded-panel bg-card p-2">
      <div className="flex flex-wrap items-center gap-4.5 rounded-tile bg-tile-customers p-4.5 text-on-tile">
        <ProgressRing value={customers - floor} max={target - floor} center="var(--tile-customers)" label="Customers">
          <span className="font-light text-[44px] leading-none tracking-[-0.04em]">{customers}</span>
          <span className="text-xs font-medium text-tile-customers-ink">of {target}</span>
        </ProgressRing>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-[15px] font-medium">{growthMode ? "Growth Mode" : "Customers"}</span>
          <span className="text-xl leading-[1.2] tracking-[-0.01em] text-balance">
            {target - customers} more to {growthMode ? "your next target" : "your first 100"}
          </span>
          {weekDelta != null && (
            <span className="self-start rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-primary">
              +{weekDelta} this week
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-3 rounded-tile bg-tile-level px-4 py-3.5 text-on-tile">
          <ProgressRing size="sm" value={xpProgress.current} max={xpProgress.target} center="var(--tile-level)" label="Level progress">
            <span className="text-base font-medium leading-none">{level}</span>
          </ProgressRing>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium">Level {level}</span>
            <span className="text-xs text-tile-level-ink">
              {xpProgress.current} / {xpProgress.target} XP
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1.5 rounded-tile bg-tile-streak p-4 text-on-tile">
          <span className="text-[13px] font-medium">Streak</span>
          {streak > 0 ? (
            <span className="text-3xl font-light leading-none">
              {streak}
              <span className="text-[13px] text-tile-streak-ink"> {streak === 1 ? "day" : "days"}</span>
            </span>
          ) : (
            <span className="text-[15px] text-tile-streak-ink">No streak yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
