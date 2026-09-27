import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { redirect } from "next/navigation";
import type { NotificationLogEntry } from "@/types/database";
import { markAllRead } from "./actions";
import { Button } from "@/components/ui/actions/Button";

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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
            Notifications
          </h1>
          <span className="text-sm text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
          </span>
        </div>
        {unreadCount > 0 && (
          <form action={markAllRead}>
            <Button type="submit" variant="secondary" size="sm">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-secondary">Nothing yet.</p>
      ) : (
        <div className="flex flex-col gap-0.5 rounded-panel bg-card p-2">
          {items.map((n) => {
            const unread = !n.read_at;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3.5 rounded-tile p-4 ${unread ? "bg-sunken" : ""}`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-accent" : "bg-strong"}`}
                />
                <span className={`min-w-0 flex-1 text-[15px] leading-[1.4] text-primary ${unread ? "font-semibold" : "font-normal"}`}>
                  {n.message}
                </span>
                <span className="shrink-0 whitespace-nowrap text-xs text-secondary">
                  {new Date(n.sent_at).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
