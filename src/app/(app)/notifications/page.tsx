import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { redirect } from "next/navigation";
import type { NotificationLogEntry, NotificationType } from "@/types/database";

// Types where the message is about one specific quest, so there's
// somewhere real to send a click. re_engagement is quest-related but
// never names a specific one (it fires whenever *any* occupying quest has
// gone quiet), so it links to the quests page in general instead of a
// quest_id. milestone/weekly_recap are pure announcements with nothing to
// navigate to — being shown on this page is what marks them read.
const QUEST_LINKED_TYPES: NotificationType[] = ["new_quest", "window_approaching", "quest_check_in"];

function notificationHref(n: NotificationLogEntry): string | null {
  if (QUEST_LINKED_TYPES.includes(n.type) && n.quest_id) {
    return `/quests#quest-${n.quest_id}`;
  }
  if (n.type === "re_engagement") {
    return "/quests";
  }
  return null;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications_log")
    .select("*")
    .eq("founder_id", founder.id)
    .eq("channel", "in_app")
    .order("sent_at", { ascending: false })
    .limit(50)
    .returns<NotificationLogEntry[]>();

  const items = notifications ?? [];
  const unreadCount = items.filter((n) => !n.read_at).length;

  // Opening this page is the "read" action now — no separate button.
  // Rendering below still uses the unread flags captured above, so a
  // notification shows as new for this one view; this write is what
  // clears it (the unread count elsewhere, like the TopNav badge) from
  // the next load on.
  if (unreadCount > 0) {
    await supabase
      .from("notifications_log")
      .update({ read_at: new Date().toISOString() })
      .eq("founder_id", founder.id)
      .is("read_at", null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
          Notifications
        </h1>
        <span className="text-sm text-secondary">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-secondary">Nothing yet.</p>
      ) : (
        <div className="flex flex-col gap-0.5 rounded-panel bg-card p-2">
          {items.map((n) => {
            const unread = !n.read_at;
            const href = notificationHref(n);
            const rowClasses = `flex items-start gap-3.5 rounded-tile p-4 ${unread ? "bg-sunken" : ""}`;
            const content = (
              <>
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-accent" : "bg-strong"}`}
                />
                <span
                  className={`min-w-0 flex-1 text-[15px] leading-[1.4] text-primary ${unread ? "font-semibold" : "font-normal"}`}
                >
                  {n.message}
                </span>
                <span className="shrink-0 whitespace-nowrap text-xs text-secondary">
                  {new Date(n.sent_at).toLocaleString()}
                </span>
              </>
            );

            return href ? (
              <Link key={n.id} href={href} className={`${rowClasses} transition-colors hover:bg-action-2`}>
                {content}
              </Link>
            ) : (
              <div key={n.id} className={rowClasses}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
