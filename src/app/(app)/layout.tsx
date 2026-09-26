import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { getSubscription, isRestricted } from "@/lib/subscriptions/status";
import { logout } from "../(auth)/actions";
import { ChatWidget } from "./chat/chat-widget";
import { TopNav } from "@/components/ui/navigation/TopNav";
import { Banner } from "@/components/ui/surfaces/Banner";
import { LinkButton } from "@/components/ui/actions/Button";

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
  let restricted = false;
  if (founder) {
    const { count } = await supabase
      .from("notifications_log")
      .select("id", { count: "exact", head: true })
      .eq("founder_id", founder.id)
      .eq("channel", "in_app")
      .is("read_at", null);
    unreadCount = count ?? 0;

    const subscription = await getSubscription(supabase, founder.id);
    restricted = isRestricted(subscription);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <TopNav unreadCount={unreadCount} onLogout={logout} />

      {restricted && (
        <div className="mx-auto max-w-[1120px] px-6 pt-4">
          <Banner
            tone="error"
            action={
              <LinkButton href="/billing" size="sm" variant="danger">
                Go to billing
              </LinkButton>
            }
          >
            Your account is restricted. Subscribe to get new quests and chat back.
          </Banner>
        </div>
      )}

      <main className="mx-auto max-w-[1120px] px-6 py-10">{children}</main>
      <ChatWidget restricted={restricted} />
    </div>
  );
}
