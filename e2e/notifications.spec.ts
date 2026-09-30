import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";

// Checklist item "in-app notifications page" — never actually opened this
// page this session despite several features (proactive check-ins, the
// pattern nudge's dashboard card, milestones) writing to notifications_log.
test.describe("notifications", () => {
  test("an announcement notification is marked read just by opening the page", async ({ page }) => {
    const founder = await createTestFounder("notifications");

    try {
      const { error } = await adminClient.from("notifications_log").insert({
        founder_id: founder.founderId,
        type: "milestone",
        channel: "in_app",
        message: "You've hit 10 customers!",
      });
      expect(error).toBeNull();

      await loginAs(page, founder.email, founder.password);
      await page.goto("/notifications");

      // This render still shows it as unread (the snapshot from before the
      // page's own mark-read write) — arriving here doesn't retroactively
      // hide what was new.
      await expect(page.getByText("1 unread")).toBeVisible();
      await expect(page.getByText("You've hit 10 customers!")).toBeVisible();

      await page.reload();
      await expect(page.getByText("You're all caught up.")).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });

  test("a quest-linked notification stays unread until clicked, then marks read and opens the quest", async ({
    page,
  }) => {
    const founder = await createTestFounder("notifications");

    try {
      const { data: quest } = await adminClient
        .from("quests")
        .select("id")
        .eq("founder_id", founder.founderId)
        .eq("status", "suggested")
        .limit(1)
        .single();
      expect(quest).toBeTruthy();

      const { error } = await adminClient.from("notifications_log").insert({
        founder_id: founder.founderId,
        type: "window_approaching",
        channel: "in_app",
        message: "Your quest is due soon.",
        quest_id: quest!.id,
      });
      expect(error).toBeNull();

      await loginAs(page, founder.email, founder.password);
      await page.goto("/notifications");

      // Merely viewing the list must NOT mark this one read — it's still
      // unread after a reload, unlike the announcement case above.
      await page.reload();
      await expect(page.getByText("1 unread")).toBeVisible();

      await page.getByRole("button", { name: /Your quest is due soon/ }).click();
      await page.waitForURL(/\/quests#quest-/);

      await page.goto("/notifications");
      await expect(page.getByText("You're all caught up.")).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
