import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";

// Checklist items "Settings save correctly," "buying motion settings
// field," and "data export" — all real, built features
// (src/app/(app)/settings/*), confirmed against the code (see the
// conversation this came from) rather than assumed from the test-plan doc.
test.describe("settings", () => {
  test("editing a profile field and the buying-motion field both persist across reload", async ({
    page,
  }) => {
    const founder = await createTestFounder("settings-profile");

    try {
      await loginAs(page, founder.email, founder.password);
      await page.goto("/settings");

      await page.getByLabel("Company name").fill("Renamed Co");
      await page
        .getByRole("button", { name: "I talk to them (calls/demos)", exact: true })
        .click();
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Saved.")).toBeVisible();

      await page.reload();
      await expect(page.getByLabel("Company name")).toHaveValue("Renamed Co");
      await expect(
        page.getByRole("button", { name: "I talk to them (calls/demos)", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });

  test("changing password works with the current password required", async ({ page }) => {
    const founder = await createTestFounder("settings-password");

    try {
      // This test re-lands on /dashboard after the re-login below — seed a
      // suggested quest so refreshQuestLog's ensureQuestSlots doesn't
      // attempt a live AI top-up along the way (irrelevant to what this
      // test checks, and slow/flaky whenever the AI providers are
      // degraded).
      await adminClient.from("quests").insert({
        founder_id: founder.founderId,
        title: "A quest waiting to be picked up",
        category: "paid",
        status: "suggested",
      });

      await loginAs(page, founder.email, founder.password);
      await page.goto("/settings");
      await page.getByRole("button", { name: "Account", exact: true }).click();

      // Same label/toggle-button ambiguity as loginAs in helpers.ts — target
      // the inputs by name instead of by label.
      await page.locator('input[name="current_password"]').fill(founder.password);
      await page.locator('input[name="new_password"]').fill("NewTestPassword456!");
      await page.getByRole("button", { name: "Change password" }).click();
      await expect(page.getByText("Password updated.")).toBeVisible();

      await page.getByRole("button", { name: "Log out" }).click();
      await expect(page).toHaveURL(/\/login/);

      await loginAs(page, founder.email, "NewTestPassword456!");
      await expect(page).toHaveURL(/\/dashboard/);
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });

  test("data export downloads a JSON file scoped to the current founder", async ({ page }) => {
    const founder = await createTestFounder("settings-export");

    try {
      await loginAs(page, founder.email, founder.password);
      await page.goto("/settings");
      await page.getByRole("button", { name: "Privacy & data", exact: true }).click();

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("link", { name: "Download my data" }).click();
      const download = await downloadPromise;

      const filePath = await download.path();
      expect(filePath).toBeTruthy();
      const contents = JSON.parse(fs.readFileSync(filePath!, "utf-8"));

      expect(contents.founder.id).toBe(founder.founderId);
      expect(contents).toHaveProperty("quests");
      expect(contents).toHaveProperty("quest_results");
      expect(contents).toHaveProperty("subscription");
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
