import { getSubscription } from "@/lib/subscriptions/status";
import { daysRemaining } from "@/lib/utils/days-remaining";
import { listInvoices } from "@/lib/stripe/invoices";
import { createCheckoutSession, createPortalSession } from "../billing/actions";
import { Button } from "@/components/ui/actions/Button";
import type { Founder, SubscriptionStatus } from "@/types/database";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const STATUS_COPY: Record<SubscriptionStatus, string> = {
  trialing: "You're on a free trial.",
  active: "Your subscription is active.",
  past_due: "Your last payment failed. Please update your payment method.",
  restricted: "Your account is restricted. Subscribe to get new quests and chat back.",
  canceled: "Your subscription is canceled.",
};

const STATUS_PILL: Record<SubscriptionStatus, { label: string; dot: string }> = {
  trialing: { label: "Trialing", dot: "bg-accent" },
  active: { label: "Active", dot: "bg-[#7BA31A]" },
  past_due: { label: "Past due", dot: "bg-[#C9A227]" },
  restricted: { label: "Restricted", dot: "bg-danger" },
  canceled: { label: "Canceled", dot: "bg-strong" },
};

// Moved here from its own /billing page (SPEC calls for billing to live
// alongside the rest of account settings) — same data, same actions,
// just rendered as a settings section instead of a standalone route.
export async function BillingSection({
  supabase,
  founder,
}: {
  supabase: SupabaseServerClient;
  founder: Founder;
}) {
  const subscription = await getSubscription(supabase, founder.id);
  const status = subscription?.status ?? "trialing";
  const hasStripeCustomer = Boolean(subscription?.stripe_customer_id);

  const trialDaysLeft =
    status === "trialing" && subscription?.trial_ends_at
      ? daysRemaining(subscription.trial_ends_at)
      : null;

  const invoices = hasStripeCustomer ? await listInvoices(subscription!.stripe_customer_id!) : [];

  const pill = STATUS_PILL[status];

  return (
    <div className="flex flex-col gap-5 rounded-panel bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-primary">Billing</h2>
        <p className="text-[13px] text-secondary">Your plan, payment method, and invoices.</p>
      </div>

      <div className="flex flex-col gap-2 rounded-panel bg-sunken p-2">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-tile bg-tile-customers p-5 text-on-tile">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-tile-customers-ink">Your plan</span>
            <span className="text-3xl font-light leading-none tracking-[-0.02em]">
              {subscription?.plan ?? "Founder"}
            </span>
            <span className="text-sm text-tile-customers-ink">
              {STATUS_COPY[status]}
              {trialDaysLeft !== null &&
                ` ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left.`}
            </span>
          </div>
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-white/75 px-2.5 text-xs font-medium text-on-tile">
            <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
            {pill.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 p-3">
          {hasStripeCustomer ? (
            <>
              <form action={createPortalSession.bind(null, "payment_method_update")}>
                <Button type="submit">Update payment method</Button>
              </form>
              <form action={createPortalSession.bind(null, "subscription_cancel")}>
                <Button type="submit" variant="secondary">
                  Cancel subscription
                </Button>
              </form>
            </>
          ) : (
            <form action={createCheckoutSession}>
              <Button type="submit">Subscribe</Button>
            </form>
          )}
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm font-medium text-primary">Billing history</h3>
          <div className="rounded-panel bg-sunken px-5 py-1">
            {invoices.map((invoice, i) => (
              <div
                key={invoice.id}
                className={`flex items-center gap-3 py-3.5 ${i > 0 ? "border-t border-subtle" : ""}`}
              >
                <span className="flex-1 text-sm text-primary">
                  {new Date(invoice.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-[13px] text-secondary">{invoice.amount}</span>
                <span className="w-16 text-xs font-medium capitalize text-secondary">
                  {invoice.status}
                </span>
                {invoice.hostedInvoiceUrl && (
                  <a
                    href={invoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] font-medium text-accent"
                  >
                    Receipt →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
