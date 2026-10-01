import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { redirect } from "next/navigation";
import type { NotificationLogEntry, NotificationType } from "@/types/database";
import { openNotification } from "./actions";
import { AutoMarkRead } from "./auto-mark-read";

// Types where the message is about one specific quest, so clicking through
// to it is itself the read signal — these are excluded from the
// mark-everything-else-read-on-view sweep below. re_engagement is
// quest-related but never names a specific one (it fires whenever *any*
// occupying quest has gone quiet), so it's treated like the pure
// announcements (milestone/weekly_recap): read as soon as you view this
// page, same as before.
const QUEST_LINKED_TYPES: Array<NotificationType | "admin_message"> = [
  "new_quest",
  "window_approaching",
  "quest_check_in",
];

function questHref(n: NotificationLogEntry): string | null {
  return QUEST_LINKED_TYPES.includes(n.type) && n.quest_id ? `/quests#quest-${n.quest_id}` : null;
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

  // Viewing this page marks everything read EXCEPT the quest-linked ones —
  // those only get marked read when actually clicked through (see
  // openNotification) — via AutoMarkRead below, a client effect that calls
  // a Server Action rather than writing here directly, since only an
  // action can revalidate the TopNav badge in the shared layout. Rendering
  // below uses this unread snapshot, so this view still shows what was
  // unread on arrival rather than looking pre-emptively read.
  const autoReadIds = items.filter((n) => !n.read_at && !questHref(n)).map((n) => n.id);

  return (
    <div className="flex flex-col gap-5">
      <AutoMarkRead ids={autoReadIds} />
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
            const href = questHref(n);
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

            if (href) {
              return (
                <form key={n.id} action={openNotification.bind(null, n.id, href)}>
                  <button
                    type="submit"
                    className={`${rowClasses} w-full text-left transition-colors hover:bg-action-2`}
                  >
                    {content}
                  </button>
                </form>
              );
            }

            if (n.type === "re_engagement") {
              return (
                <Link key={n.id} href="/quests" className={`${rowClasses} transition-colors hover:bg-action-2`}>
                  {content}
                </Link>
              );
            }

            return (
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
