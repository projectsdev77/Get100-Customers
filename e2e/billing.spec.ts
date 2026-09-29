import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";

// Checklist items "Stripe checkout" and "trial expiry -> restricted."
// billing-4 (the "Update payment method"/"Cancel subscription" portal
// buttons) is deliberately not covered here — createPortalSession
// (src/app/(app)/billing/actions.ts) redirects to /settings unless
// subscriptions.stripe_customer_id is already set, which means bootstrapping
// a real Stripe customer via the Stripe API before the test even starts.
// That's a reasonable next step, just a bigger lift than the checkout
// redirect below, which needs no pre-existing Stripe state.
test.describe("billing", () => {
  test("subscribing redirects to Stripe checkout", async ({ page }) => {
    const founder = await createTestFounder("billing-checkout");

    try {
      await loginAs(page, founder.email, founder.password);
      await page.goto("/settings");
      await page.getByRole("button", { name: "Billing", exact: true }).click();

      await Promise.all([
        page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 }),
        page.getByRole("button", { name: "Subscribe" }).click(),
      ]);
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });

  test("an expired trial with no payment moves the account to restricted", async ({ page }) => {
    const founder = await createTestFounder("billing-trial");

    try {
      const yesterday = new Date(Date.now() - 24 * 3600_000).toISOString();
      const { error } = await adminClient
        .from("subscriptions")
        .update({ trial_ends_at: yesterday })
        .eq("founder_id", founder.founderId);
      expect(error).toBeNull();

      await loginAs(page, founder.email, founder.password);
      // First load runs refreshQuestLog -> applySubscriptionLifecycle
      // (src/lib/quests/lifecycle.ts), which flips the DB status — the
      // layout's own subscription read for the banner can race that same
      // write within one request, so a second load is what actually
      // observes the flipped status rather than the stale one.
      await page.goto("/dashboard");
      await page.goto("/dashboard");

      await expect(
        page.getByText("Your account is restricted. Subscribe to get new quests and chat back."),
      ).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
