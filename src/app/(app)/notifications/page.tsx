import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { redirect } from "next/navigation";
import type { NotificationLogEntry } from "@/types/database";
import { markAllRead } from "./actions";

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
  const hasUnread = items.some((n) => !n.read_at);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Notifications</h1>
        {hasUnread && (
          <form action={markAllRead}>
            <button
              type="submit"
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
            >
              Mark all read
            </button>
          </form>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Nothing yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((n) => (
          <div
            key={n.id}
            className={`rounded border px-3 py-2 text-sm ${
              n.read_at
                ? "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
                : "border-zinc-300 bg-zinc-50 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            }`}
          >
            {n.message}
            <span className="ml-2 text-xs text-zinc-400">
              {new Date(n.sent_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
