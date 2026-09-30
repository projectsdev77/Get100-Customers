import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";

// Checklist item "in-app notifications page" — never actually opened this
// page this session despite several features (proactive check-ins, the
// pattern nudge's dashboard card, milestones) writing to notifications_log.
test.describe("notifications", () => {
  test("opening the page shows an unread notification, then marks it read", async ({ page }) => {
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

      // The view itself is what marks it read now (no button) — this
      // render still shows it as unread, using the state from before that
      // write, so arriving here doesn't retroactively hide what was new.
      await expect(page.getByText("1 unread")).toBeVisible();
      await expect(page.getByText("New quest: Send 10 cold emails to your ICP")).toBeVisible();

      await page.reload();
      await expect(page.getByText("You're all caught up.")).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });

  test("a quest-linked notification links to that quest, an announcement doesn't", async ({ page }) => {
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

      const { error } = await adminClient.from("notifications_log").insert([
        {
          founder_id: founder.founderId,
          type: "window_approaching",
          channel: "in_app",
          message: "Your quest is due soon.",
          quest_id: quest!.id,
        },
        {
          founder_id: founder.founderId,
          type: "milestone",
          channel: "in_app",
          message: "You've hit 10 customers!",
        },
      ]);
      expect(error).toBeNull();

      await loginAs(page, founder.email, founder.password);
      await page.goto("/notifications");

      await expect(page.getByRole("link", { name: /Your quest is due soon/ })).toHaveAttribute(
        "href",
        `/quests#quest-${quest!.id}`,
      );
      await expect(page.getByText("You've hit 10 customers!")).toBeVisible();
      await expect(page.getByRole("link", { name: /You've hit 10 customers/ })).toHaveCount(0);
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
