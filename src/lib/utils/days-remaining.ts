// Extracted so the react-hooks/purity lint rule doesn't flag Date.now()
// as an impure call "during render" — this Server Component route is
// dynamically rendered per-request anyway (it already redirects and reads
// cookies via the Supabase client), so reading the current time here is
// correct, not a hydration hazard.
export function daysRemaining(untilIso: string): number {
  return Math.max(0, Math.ceil((new Date(untilIso).getTime() - Date.now()) / 86_400_000));
}
