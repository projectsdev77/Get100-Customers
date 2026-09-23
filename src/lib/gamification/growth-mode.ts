// Reaching 100 isn't a hard stop (SPEC §14) — past it, the target steps
// through the design handoff's ladder (100 → 250 → 500 → 1000 → 2500 →
// 5000 → 10000 → +5000 from there).
const TARGETS = [100, 250, 500, 1000, 2500, 5000, 10000];

export function getProgressTarget(currentCount: number): number {
  const next = TARGETS.find((t) => currentCount < t);
  if (next) return next;
  return Math.ceil((currentCount + 1) / 5000) * 5000;
}

// The floor of the current stretch segment (0 below 100, otherwise the
// previous rung) — the ring shows progress *within* this segment, not
// from zero, e.g. 142 customers is (142-100)/(250-100) = 28% of the way
// to 250, not 142% of 100.
export function getProgressFloor(currentCount: number): number {
  const target = getProgressTarget(currentCount);
  const index = TARGETS.indexOf(target);
  return index <= 0 ? 0 : TARGETS[index - 1];
}

export function isInGrowthMode(currentCount: number): boolean {
  return currentCount >= 100;
}
