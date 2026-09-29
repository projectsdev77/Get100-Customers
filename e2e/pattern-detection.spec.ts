import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";
import { recomputeGrowthProfile } from "../src/lib/growth-profile/recompute";

// Checklist items "Worth noticing nudge" and "sales-cycle patience" — both
// are pure functions over quest history (detectSkipPattern,
// recomputeGrowthProfile), not AI-generated text, so the exact copy they
// produce is a stable thing to assert on rather than something that drifts
// with the model's phrasing.
//
// recomputeGrowthProfile expects the cookie-based server client type, but
// only ever uses it for a read — passing the admin client here (which has
// the same `.from().select()` shape) reads/writes the same rows an
// RLS-scoped call would, without needing a real logged-in request context
// in a Node test script.
test.describe("skip-pattern and growth-profile signals", () => {
  test('dashboard shows "Worth noticing" after 3 skipped/expired quests in one category, and it clears once one converts', async ({
    page,
  }) => {
    const founder = await createTestFounder("pattern");

    try {
      const base = Date.now();
      const older = (hoursAgo: number) => new Date(base - hoursAgo * 3600_000).toISOString();

      const { error } = await adminClient.from("quests").insert([
        {
          founder_id: founder.founderId,
          title: "Cold email attempt 1",
          category: "cold_email",
          status: "skipped",
          skip_reason: "no_time",
          resolved_at: older(3),
        },
        {
          founder_id: founder.founderId,
          title: "Cold email attempt 2",
          category: "cold_email",
          status: "expired",
          resolved_at: older(2),
        },
        {
          founder_id: founder.founderId,
          title: "Cold email attempt 3",
          category: "cold_email",
          status: "skipped",
          skip_reason: "too_hard",
          resolved_at: older(1),
        },
      ]);
      expect(error).toBeNull();

      await loginAs(page, founder.email, founder.password);
      await page.goto("/dashboard");

      await expect(
        page.getByText(
          "You've skipped or let expire your last 3 Cold email quests — is that really not working, or does it just not feel doable right now?",
        ),
      ).toBeVisible();

      // A more recent completed quest in the same category becomes part of
      // the "most recent 3" and breaks the all-avoidant streak.
      const { error: completeError } = await adminClient.from("quests").insert({
        founder_id: founder.founderId,
        title: "Cold email attempt 4 (finally done)",
        category: "cold_email",
        status: "completed",
        resolved_at: older(0),
        completed_at: older(0),
      });
      expect(completeError).toBeNull();

      await page.goto("/dashboard");
      await expect(page.getByText(/Cold email quests/)).toHaveCount(0);
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });

  test("a sales-led founder's channel isn't called \"not working\" until 4 non-converting attempts", async ({
    page,
  }) => {
    const founder = await createTestFounder("patience", {
      overrides: { buying_motion: "sales_led" },
    });

    try {
      const seedNonConvertingAttempt = async (n: number) => {
        const { data: quest, error: questError } = await adminClient
          .from("quests")
          .insert({
            founder_id: founder.founderId,
            title: `Cold email sales-led attempt ${n}`,
            category: "cold_email",
            status: "completed",
            resolved_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        expect(questError).toBeNull();

        const { error: resultError } = await adminClient.from("quest_results").insert({
          quest_id: quest!.id,
          founder_id: founder.founderId,
          structured_answers: { converted: false },
        });
        expect(resultError).toBeNull();
      };

      for (let i = 1; i <= 3; i++) {
        await seedNonConvertingAttempt(i);
      }
      // adminClient stands in for the cookie-based server client here — see
      // the file-level comment above.
      await recomputeGrowthProfile(adminClient as never, founder.founderId, "sales_led");

      await loginAs(page, founder.email, founder.password);
      await page.goto("/dashboard");
      await expect(page.getByText("What's not working")).toHaveCount(0);

      await seedNonConvertingAttempt(4);
      await recomputeGrowthProfile(adminClient as never, founder.founderId, "sales_led");

      await page.goto("/dashboard");
      await expect(page.getByText("What's not working")).toBeVisible();
      await expect(page.getByText(/given a longer sales cycle/)).toBeVisible();
    } finally {
      await deleteTestFounder(founder.authUserId);
    }
  });
});
