import type { GrowthProfile } from "@/types/database";

// A deterministic, non-AI signal (same "keep the numbers non-AI" philosophy
// as recomputeGrowthProfile itself, SPEC §9) for "this founder needs an
// actual conversation, not another quest." Never used to auto-pause quest
// generation or make a strategy decision on its own — only to (a) nudge the
// founder toward the existing chat coach and (b) prime that coach's prompt
// with the context, so a real conversation can happen instead of silently
// suggesting yet another tactic. See layout.tsx and chat.ts for where this
// is used.
const STUCK_ATTEMPT_THRESHOLD = 8;

export function isFounderStuck(
  currentCustomerCount: number,
  growth: Pick<GrowthProfile, "channels_tried"> | null,
): boolean {
  if (currentCustomerCount > 0) return false;
  if (!growth) return false;

  const totalAttempts = Object.values(growth.channels_tried).reduce(
    (sum, stats) => sum + stats.attempts,
    0,
  );
  return totalAttempts >= STUCK_ATTEMPT_THRESHOLD;
}
