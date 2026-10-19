// Used for founders who haven't had a timezone saved yet. Matches the
// daily nudge's original fixed send time (13:00 UTC is 9am US Eastern).
export const DEFAULT_TIMEZONE = "America/New_York";

export function isValidTimeZone(value: string): boolean {
  if (!value || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function localHour(timeZone: string, at: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" })
    .formatToParts(at)
    .find((part) => part.type === "hour")?.value;
  return Number(hour);
}

// Browsers sometimes report an older alias (e.g. Asia/Calcutta) that isn't
// in the canonical list, so the founder's saved value is always included.
export function timeZoneOptions(current: string | null): string[] {
  const all = Intl.supportedValuesOf("timeZone");
  return current && !all.includes(current) ? [current, ...all] : all;
}
