import type { EmailNotificationPrefs, NotificationType } from "@/types/database";
import { updateNotificationPrefs } from "./actions";
import { Button } from "@/components/ui/actions/Button";
import { fieldClasses } from "@/components/ui/forms/Field";
import { DEFAULT_TIMEZONE, timeZoneOptions } from "@/lib/founders/timezone";

// new_quest is deliberately excluded — a suggestion refilling never
// notified by email in the first place (see ensureQuestSlots), so a
// toggle for it here would control nothing.
type ToggleableType = Exclude<NotificationType, "new_quest">;

const LABELS: Record<ToggleableType, string> = {
  window_approaching: "Quest due soon",
  re_engagement: "Re-engagement nudges",
  milestone: "Milestones (level up, customer count)",
  weekly_recap: "Weekly progress recap",
  quest_check_in: "Mid-quest check-ins",
  daily_nudge: "Daily reminder when a quest has gone quiet",
};

export function NotificationPrefsForm({
  prefs,
  timezone,
}: {
  prefs: EmailNotificationPrefs;
  timezone: string | null;
}) {
  const selected = timezone ?? DEFAULT_TIMEZONE;
  return (
    <form action={updateNotificationPrefs} className="flex flex-col gap-4 rounded-panel bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-primary">Notifications</h2>
        <p className="text-[13px] text-secondary">
          In-app notifications are always on. These toggles control email only.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {(Object.keys(LABELS) as ToggleableType[]).map((type) => (
          <label key={type} className="flex items-center gap-2.5 text-sm text-primary">
            <input
              type="checkbox"
              name={`pref_${type}`}
              defaultChecked={prefs[type] !== false}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            {LABELS[type]}
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1.5 border-t border-subtle pt-4">
        <span className="text-[13px] font-medium text-primary">Your timezone</span>
        <select name="timezone" defaultValue={selected} className={`${fieldClasses()} max-w-[320px]`}>
          {timeZoneOptions(selected).map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <span className="text-xs text-secondary">Daily reminders arrive around 9am in this timezone.</span>
      </label>
      <Button type="submit" variant="secondary" size="sm" className="self-start">
        Save preferences
      </Button>
    </form>
  );
}
