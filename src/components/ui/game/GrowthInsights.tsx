import { Card } from "@/components/ui/surfaces/Card";
import type { GrowthProfile } from "@/types/database";

// Founder-facing surface for growth_profiles (SPEC §16 — "a simple growth
// insights panel surfaced from the growth profile"). The data itself
// (bottleneck_hypothesis/what_working/what_not_working) was already being
// computed on every quest completion (recomputeGrowthProfile) and fed into
// AI prompts, but was never actually shown to the founder anywhere — this
// is that missing display, not new logic.
export function GrowthInsights({
  growth,
}: {
  growth: Pick<GrowthProfile, "bottleneck_hypothesis" | "what_working" | "what_not_working"> | null;
}) {
  const bottleneck =
    growth?.bottleneck_hypothesis ??
    "Complete a few quests and check back here — we'll start surfacing what's working and what isn't.";
  const working = growth?.what_working ?? [];
  const notWorking = growth?.what_not_working ?? [];

  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="text-base font-medium text-primary">Growth insights</h2>
      <p className="text-sm text-primary">{bottleneck}</p>

      {working.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-secondary">What&apos;s working</span>
          <ul className="flex flex-col gap-1">
            {working.slice(0, 3).map((w, i) => (
              <li key={i} className="text-sm text-primary">
                • {w.insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {notWorking.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-secondary">What&apos;s not working</span>
          <ul className="flex flex-col gap-1">
            {notWorking.slice(0, 3).map((w, i) => (
              <li key={i} className="text-sm text-secondary">
                • {w.insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
