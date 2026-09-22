// Reaching 100 isn't a hard stop (SPEC §14) — past it, the target becomes
// the next stretch milestone (100 → 250 → 500 → 1000 → +500 from there).
export function getProgressTarget(currentCount: number): number {
  const milestones = [100, 250, 500, 1000];
  const next = milestones.find((m) => currentCount < m);
  if (next) return next;
  return Math.ceil((currentCount + 1) / 500) * 500;
}

export function isInGrowthMode(currentCount: number): boolean {
  return currentCount >= 100;
}
