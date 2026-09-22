import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
          <Link href="/settings" className="text-zinc-600 hover:underline dark:text-zinc-400">
            Settings
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
