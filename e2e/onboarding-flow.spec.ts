import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs } from "./helpers";

// Checklist items "Growth Mode at 100+ customers," and the new "Referrals /
// Local & in-person" channels and "buying motion" onboarding question
// appearing at all — one real walkthrough of the wizard covers all three,
// same shape as golden-path.spec.ts's walkthrough but entering 150 as the
// starting customer count and picking the new options where they show up.
test.describe("onboarding: growth mode and new fields", () => {
  test("100+ starting customers skips straight to Growth Mode, and the new channel/motion options are there", async ({
    page,
  }) => {
    const founder = await createTestFounder("onboarding-growth", { completeProfile: false });

    try {
      await loginAs(page, founder.email, founder.password);
      await expect(page).toHaveURL(/\/onboarding/);

      await page.getByRole("button", { name: "Skip" }).click();

      await page.getByRole("textbox").fill("Scale Co");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      await page.getByRole("textbox").fill("B2B SaaS");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      await page.getByRole("textbox").fill("Ops tooling for mid-market logistics teams.");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      await page.getByRole("textbox").fill("Ops leads at 200-1000 person logistics companies");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      await page.getByRole("button", { name: "Launched", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Channels tried — confirms the two new categories from this
      // session's taxonomy expansion are real, selectable chips.
      await expect(page.getByRole("button", { name: "Referrals", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Local & in-person", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Referrals", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Already past 100 — this is the case Growth Mode exists for.
      await page.getByRole("spinbutton").fill("150");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      await page.getByRole("button", { name: "3–5", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Buying motion — the new question this session's gap-#7 fix added.
      await expect(page.getByText("How do people actually buy from you?")).toBeVisible();
      await page.getByRole("button", { name: "I talk to them (calls/demos)", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      await page.getByRole("button", { name: "Start my quest log" }).click();
      await expect(page).toHaveURL(/\/dashboard/);

      // isInGrowthMode (src/lib/gamification/growth-mode.ts) flips at >=100
      // customers — the HUD switches from "Customers" / "first 100" copy to
      // "Growth Mode" / "next target" copy.
      await expect(page.getByText("Growth Mode")).toBeVisible();
      await expect(page.getByText("more to your next target")).toBeVisible();
      await expect(page.getByText("more to your first 100")).toHaveCount(0);
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
