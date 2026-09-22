import type { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Subscription } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getSubscription(
  supabase: SupabaseServerClient,
  founderId: string,
): Promise<Subscription | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("founder_id", founderId)
    .maybeSingle<Subscription>();
  return data ?? null;
}

// "Restricted" is the only status that actually blocks generative features
// (SPEC §3 — read-only history/progress, no new quests, no chat).
export function isRestricted(subscription: Subscription | null): boolean {
  return subscription?.status === "restricted";
}

// Two time-based transitions Stripe itself won't push to us on a schedule:
// trial expiring, and a past_due grace period running out. No cron for a
// zero-budget build — same lazy-check-on-page-load pattern as quest expiry
// and the notification triggers (see src/lib/quests/lifecycle.ts). Uses
// the admin client throughout, not the founder's session client — a
// subscription status write must never be reachable through the founder's
// own RLS-scoped session (there is deliberately no update policy for it;
// only Stripe webhooks, this lifecycle check, and admin overrides may
// change it).
export async function applySubscriptionLifecycle(founderId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("*")
    .eq("founder_id", founderId)
    .maybeSingle<Subscription>();
  if (!subscription) return;

  const nowIso = new Date().toISOString();

  const trialExpired =
    subscription.status === "trialing" &&
    subscription.trial_ends_at &&
    subscription.trial_ends_at < nowIso;

  const graceExpired =
    subscription.status === "past_due" &&
    subscription.grace_period_ends_at &&
    subscription.grace_period_ends_at < nowIso;

  if (trialExpired || graceExpired) {
    await admin
      .from("subscriptions")
      .update({ status: "restricted", updated_at: nowIso })
      .eq("founder_id", founderId);
  }
}
