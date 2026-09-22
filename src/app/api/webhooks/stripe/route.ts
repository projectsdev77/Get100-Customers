import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

function customerId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

// Test-mode-first (SPEC §3, PHASES.md Phase 10) — fully buildable and
// testable with Stripe test keys; going live is a key swap + business
// verification (Phase 12), not new code.
export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const founderId = session.client_reference_id;
      if (founderId) {
        await admin
          .from("subscriptions")
          .update({
            status: "active",
            stripe_customer_id: customerId(session.customer),
            billing_provider_ref:
              typeof session.subscription === "string"
                ? session.subscription
                : (session.subscription?.id ?? null),
            updated_at: nowIso,
          })
          .eq("founder_id", founderId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const custId = customerId(sub.customer);
      const status =
        sub.status === "active"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : sub.status === "canceled"
              ? "canceled"
              : null;
      if (custId && status) {
        await admin
          .from("subscriptions")
          .update({ status, updated_at: nowIso })
          .eq("stripe_customer_id", custId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const custId = customerId(sub.customer);
      if (custId) {
        await admin
          .from("subscriptions")
          .update({ status: "canceled", updated_at: nowIso })
          .eq("stripe_customer_id", custId);
      }
      break;
    }

    // Grace period starts here (SPEC §3 — 7-day dunning window before
    // restricted mode). The actual restricted transition happens lazily
    // (src/lib/subscriptions/status.ts) once grace_period_ends_at passes.
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const custId = customerId(invoice.customer);
      if (custId) {
        const gracePeriodEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await admin
          .from("subscriptions")
          .update({ status: "past_due", grace_period_ends_at: gracePeriodEndsAt, updated_at: nowIso })
          .eq("stripe_customer_id", custId);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const custId = customerId(invoice.customer);
      if (custId) {
        await admin
          .from("subscriptions")
          .update({ status: "active", grace_period_ends_at: null, updated_at: nowIso })
          .eq("stripe_customer_id", custId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
