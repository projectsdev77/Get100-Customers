import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { logout } from "../(auth)/actions";
import { ChatWidget } from "./chat/chat-widget";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const founder = await getCurrentFounder(supabase);
  let unreadCount = 0;
  if (founder) {
    const { count } = await supabase
      .from("notifications_log")
      .select("id", { count: "exact", head: true })
      .eq("founder_id", founder.id)
      .eq("channel", "in_app")
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <Link href="/dashboard" className="font-semibold text-black dark:text-zinc-50">
          Get100-Customers
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/quests" className="text-zinc-600 hover:underline dark:text-zinc-400">
            Quests
          </Link>
          <Link href="/notifications" className="text-zinc-600 hover:underline dark:text-zinc-400">
            Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
          <Link href="/settings" className="text-zinc-600 hover:underline dark:text-zinc-400">
            Settings
          </Link>
          <Link href="/billing" className="text-zinc-600 hover:underline dark:text-zinc-400">
            Billing
          </Link>
          <form action={logout}>
            <button type="submit" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Log out
            </button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-2xl px-6 py-10">{children}</main>
      <ChatWidget />
    </div>
  );
}
