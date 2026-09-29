import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";

// Checklist item "in-app notifications page" — never actually opened this
// page this session despite several features (proactive check-ins, the
// pattern nudge's dashboard card, milestones) writing to notifications_log.
test.describe("notifications", () => {
  test("the notifications page lists a seeded in-app notification as unread", async ({ page }) => {
    const founder = await createTestFounder("notifications");

    try {
      const { error } = await adminClient.from("notifications_log").insert({
        founder_id: founder.founderId,
        type: "new_quest",
        channel: "in_app",
        message: "New quest: Send 10 cold emails to your ICP",
      });
      expect(error).toBeNull();

      await loginAs(page, founder.email, founder.password);
      await page.goto("/notifications");

      await expect(page.getByText("1 unread")).toBeVisible();
      await expect(page.getByText("New quest: Send 10 cold emails to your ICP")).toBeVisible();

      await page.getByRole("button", { name: "Mark all as read" }).click();
      await expect(page.getByText("You're all caught up.")).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
