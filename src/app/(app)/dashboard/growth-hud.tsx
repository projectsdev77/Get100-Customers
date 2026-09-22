import { xpIntoCurrentLevel } from "@/lib/gamification/level";
import type { Founder } from "@/types/database";

// The primary "game state" surface (SPEC §6) — progress bar is the
// centerpiece, XP/level/streak are secondary but always visible.
export function GrowthHud({ founder }: { founder: Founder }) {
  const customerPct = Math.min(100, (founder.current_customer_count / 100) * 100);
  const xpProgress = xpIntoCurrentLevel(founder.xp);
  const xpPct = (xpProgress.current / xpProgress.target) * 100;

  return (
    <div className="flex flex-col gap-4 rounded border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Progress to 100 customers</p>
          <p className="text-sm font-medium text-black dark:text-zinc-50">
            {founder.current_customer_count} / 100
          </p>
        </div>
        <div className="mt-1 h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-3 rounded-full bg-black transition-all dark:bg-zinc-50"
            style={{ width: `${customerPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-50 dark:text-black">
            Level {founder.level}
          </span>
          <div className="h-1.5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {xpProgress.current}/{xpProgress.target} XP
          </span>
        </div>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {founder.streak_count > 0
            ? `${founder.streak_count} day streak`
            : "No streak yet — complete a quest to start one"}
        </span>
      </div>
    </div>
  );
}
