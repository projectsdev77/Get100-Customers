import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { getGrowthProfile } from "@/lib/quests/lifecycle";
import { isFounderStuck } from "@/lib/growth-profile/stuck";
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
  let stuck = false;
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

    const growth = await getGrowthProfile(supabase, founder.id);
    stuck = isFounderStuck(founder.current_customer_count, growth);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <TopNav unreadCount={unreadCount} onLogout={logout} />

      {restricted && (
        <div className="mx-auto max-w-[1120px] px-6 pt-4">
          <Banner
            tone="error"
            action={
              <LinkButton href="/settings" size="sm" variant="danger">
                Go to billing
              </LinkButton>
            }
          >
            Your account is restricted. Subscribe to get new quests and chat back.
          </Banner>
        </div>
      )}

      {/*
        Deterministic signal (isFounderStuck, no AI judgment call) for
        "several quests done, zero conversions yet" — nudges toward the
        existing chat coach rather than silently generating another quest.
        Skipped while restricted since quests/chat are already paused then.
      */}
      {stuck && !restricted && (
        <div className="mx-auto max-w-[1120px] px-6 pt-4">
          <Banner tone="info">
            You&apos;ve completed several quests without a conversion yet — that&apos;s worth a
            real conversation. Try asking your coach (bottom right) what might need to change.
          </Banner>
        </div>
      )}

      <main className="mx-auto max-w-[1120px] px-6 py-10">{children}</main>
      <ChatWidget restricted={restricted} stuck={stuck} />
    </div>
  );
}
