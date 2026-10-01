import { getStripeClient } from "./client";

export interface LiveSubscriptionState {
  cancelAtPeriodEnd: boolean;
  periodEndIso: string | null;
}

// Stripe is the only source of truth for "pending cancellation" — our own
// subscriptions.status column stays "active" until the period actually
// ends (scheduling a cancel_at_period_end doesn't change status), and no
// webhook fires when a founder merely schedules a cancellation, only when
// it actually takes effect (customer.subscription.deleted, or .updated
// with a terminal status). Fetched live here, same approach as
// listInvoices, rather than mirrored into our own DB.
export async function getLiveSubscriptionState(subscriptionId: string): Promise<LiveSubscriptionState> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  // current_period_end lives on the subscription item, not the
  // subscription itself, as of Stripe's newer API versions.
  const periodEnd = subscription.items.data[0]?.current_period_end;
  return {
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    periodEndIso: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  };
}
