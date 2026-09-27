import type { EmailNotificationPrefs, NotificationType } from "@/types/database";
import { updateNotificationPrefs } from "./actions";
import { Button } from "@/components/ui/actions/Button";

const LABELS: Record<NotificationType, string> = {
  new_quest: "New quest available",
  window_approaching: "Quest due soon",
  re_engagement: "Re-engagement nudges",
  milestone: "Milestones (level up, customer count)",
  weekly_recap: "Weekly progress recap",
};

export function NotificationPrefsForm({ prefs }: { prefs: EmailNotificationPrefs }) {
  return (
    <form action={updateNotificationPrefs} className="flex flex-col gap-4 rounded-panel bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-primary">Notifications</h2>
        <p className="text-[13px] text-secondary">
          In-app notifications are always on. These toggles control email only.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {(Object.keys(LABELS) as NotificationType[]).map((type) => (
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
      <Button type="submit" variant="secondary" size="sm" className="self-start">
        Save preferences
      </Button>
    </form>
  );
}
