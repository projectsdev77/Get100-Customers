import Stripe from "stripe";

let client: Stripe | null = null;

// Built entirely against Stripe test mode (free, no business verification
// needed) — see SPEC §3, PHASES.md Phase 10/12 for the test→live key swap
// at launch.
export function getStripeClient(): Stripe {
  if (!client) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("STRIPE_SECRET_KEY is not set — see .env.example");
    client = new Stripe(apiKey);
  }
  return client;
}
