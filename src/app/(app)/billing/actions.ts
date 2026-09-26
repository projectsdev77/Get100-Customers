"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { getStripeClient } from "@/lib/stripe/client";
import { getSubscription } from "@/lib/subscriptions/status";

export async function createCheckoutSession() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscription = await getSubscription(supabase, founder.id);
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer: subscription?.stripe_customer_id ?? undefined,
    customer_email: subscription?.stripe_customer_id ? undefined : (user?.email ?? undefined),
    client_reference_id: founder.id,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=cancelled`,
  });

  if (session.url) redirect(session.url);
}

// Deep-links straight into the portal's payment-method or cancellation
// flow (design handoff's separate "Update payment method"/"Cancel
// subscription" buttons) instead of dropping the founder on the portal's
// generic landing page.
export async function createPortalSession(flow?: "payment_method_update" | "subscription_cancel") {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) redirect("/login");

  const subscription = await getSubscription(supabase, founder.id);
  if (!subscription?.stripe_customer_id) redirect("/settings");

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    ...(flow ? { flow_data: { type: flow } } : {}),
  });

  redirect(session.url);
}
