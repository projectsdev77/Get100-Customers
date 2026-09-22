// Engagement streak from quest-completion activity, not forced daily logins
// (SPEC §6/§11). Increments once per new calendar day of activity, as long
// as the gap since the last activity is within the 7-day reset window —
// otherwise it starts a fresh streak of 1 rather than dropping to 0
// (completing a quest today is itself a day of activity).
export function computeNextStreak(
  currentStreak: number,
  lastActivityAt: string | null,
  now: Date = new Date(),
): number {
  if (!lastActivityAt) return 1;

  const today = startOfUtcDay(now);
  const last = startOfUtcDay(new Date(lastActivityAt));
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);

  if (diffDays <= 0) return currentStreak; // already active today
  if (diffDays <= 7) return currentStreak + 1;
  return 1; // inactivity window passed — fresh streak, not clawed-back XP/level
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
