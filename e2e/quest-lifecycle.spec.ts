import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";

// Checklist items "3-active cap" and "quest journal" — both pure business
// rules (MAX_ACTIVE_QUESTS, the completed/skipped/expired history filter),
// not AI-generated content, so seeding rows directly and asserting on the
// exact copy the app renders is reliable rather than fragile.
test.describe("quest lifecycle", () => {
  test("a 4th quest can't be accepted while 3 are already active", async ({ page }) => {
    const founder = await createTestFounder("cap");

    try {
      const { error: activeError } = await adminClient.from("quests").insert([
        { founder_id: founder.founderId, title: "Active quest A", category: "cold_email", status: "active" },
        { founder_id: founder.founderId, title: "Active quest B", category: "content", status: "active" },
        { founder_id: founder.founderId, title: "Active quest C", category: "communities", status: "active" },
      ]);
      expect(activeError).toBeNull();

      const { error: suggestedError } = await adminClient.from("quests").insert({
        founder_id: founder.founderId,
        title: "A 4th quest waiting in the wings",
        category: "paid",
        status: "suggested",
      });
      expect(suggestedError).toBeNull();

      await loginAs(page, founder.email, founder.password);
      await page.goto("/quests");

      await expect(page.getByText("Active (3 of 3)")).toBeVisible();

      await page.getByRole("button", { name: "Accept" }).first().click();

      // acceptQuest (src/app/(app)/quests/actions.ts) checks the active
      // count before touching the DB and redirects with this exact flash
      // message instead of accepting — asserting the literal string, not
      // just "some error showed," so a copy change to this specific
      // guardrail doesn't silently start passing on the wrong message.
      await expect(
        page.getByText("You already have 3 active quests. Finish or skip one first."),
      ).toBeVisible();
      await expect(page.getByText("Active (3 of 3)")).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });

  test("the quest journal lists completed and skipped quests", async ({ page }) => {
    const founder = await createTestFounder("journal");

    try {
      const now = new Date().toISOString();
      const { error } = await adminClient.from("quests").insert([
        {
          founder_id: founder.founderId,
          title: "A completed cold email quest",
          category: "cold_email",
          status: "completed",
          resolved_at: now,
          completed_at: now,
        },
        {
          founder_id: founder.founderId,
          title: "A skipped content quest",
          category: "content",
          status: "skipped",
          skip_reason: "no_time",
          resolved_at: now,
        },
      ]);
      expect(error).toBeNull();

      await loginAs(page, founder.email, founder.password);
      await page.goto("/quests");

      await expect(page.getByRole("heading", { name: "Quest journal" })).toBeVisible();
      await expect(page.getByText("A completed cold email quest")).toBeVisible();
      await expect(page.getByText("A skipped content quest")).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
