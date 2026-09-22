import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { getSubscription } from "@/lib/subscriptions/status";
import { daysRemaining } from "@/lib/utils/days-remaining";
import { createCheckoutSession, createPortalSession } from "./actions";

const STATUS_COPY: Record<string, string> = {
  trialing: "You're on a free trial.",
  active: "Your subscription is active.",
  past_due: "Your last payment failed — please update your payment method.",
  restricted: "Your account is restricted. Subscribe to get new quests and chat back.",
  canceled: "Your subscription is canceled.",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) redirect("/login");

  const subscription = await getSubscription(supabase, founder.id);
  const status = subscription?.status ?? "trialing";
  const hasStripeCustomer = Boolean(subscription?.stripe_customer_id);

  const trialDaysLeft =
    status === "trialing" && subscription?.trial_ends_at
      ? daysRemaining(subscription.trial_ends_at)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Billing</h1>

      <div className="rounded border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{STATUS_COPY[status]}</p>
        {trialDaysLeft !== null && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your trial.
          </p>
        )}

        <div className="mt-4 flex gap-3">
          {hasStripeCustomer ? (
            <form action={createPortalSession}>
              <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
              >
                Manage billing
              </button>
            </form>
          ) : (
            <form action={createCheckoutSession}>
              <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
