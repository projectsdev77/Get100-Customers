import type { EmailNotificationPrefs, NotificationType } from "@/types/database";
import { updateNotificationPrefs } from "./actions";

const LABELS: Record<NotificationType, string> = {
  new_quest: "New quest available",
  window_approaching: "Quest due soon",
  re_engagement: "Re-engagement nudges",
  milestone: "Milestones (level up, customer count)",
  weekly_recap: "Weekly progress recap",
};

export function NotificationPrefsForm({ prefs }: { prefs: EmailNotificationPrefs }) {
  return (
    <form action={updateNotificationPrefs} className="flex flex-col gap-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        In-app notifications are always on. These toggles control email only.
      </p>
      {(Object.keys(LABELS) as NotificationType[]).map((type) => (
        <label key={type} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name={`pref_${type}`} defaultChecked={prefs[type] !== false} />
          {LABELS[type]}
        </label>
      ))}
      <button
        type="submit"
        className="mt-2 self-start rounded bg-black px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
      >
        Save preferences
      </button>
    </form>
  );
}
