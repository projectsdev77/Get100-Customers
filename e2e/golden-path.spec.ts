import { test, expect } from "@playwright/test";
import { TEST_EMAIL, TEST_PASSWORD } from "./test-user";

// Full founder journey against a live Supabase/Gemini/Stripe setup (see
// playwright.config.ts and SETUP.md — this is not a mocked test). Runs as
// one continuous flow in a single test, since each Playwright test gets a
// fresh browser context by default and this journey depends on the login
// session carrying forward from one step to the next.
test.describe("founder golden path", () => {
  test("an unauthenticated visitor is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login → onboarding → dashboard → quest → settings → logout", async ({
    page,
  }) => {
    await test.step("log in as the freshly provisioned test founder", async () => {
      await page.goto("/login");
      await page.getByLabel("Email").fill(TEST_EMAIL);
      await page.getByLabel("Password").fill(TEST_PASSWORD);
      await page.getByRole("button", { name: "Log in" }).click();
      // A brand-new founder has no profile yet, so the (app) layout
      // redirects straight to onboarding (see src/proxy.ts / dashboard
      // page's profileComplete check).
      await expect(page).toHaveURL(/\/onboarding/);
    });

    await test.step("complete onboarding", async () => {
      // Step 0: optional website/notes analyzer — skip it.
      await page.getByRole("button", { name: "Skip" }).click();

      // Step 1: company name (plain text input, no accessible label —
      // it's the only textbox visible for this step).
      await page.getByRole("textbox").fill("Acme Analytics");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 2: industry.
      await page.getByRole("textbox").fill("SaaS");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 3: product description (textarea).
      await page
        .getByRole("textbox")
        .fill("Month-end reporting for seed-stage SaaS finance teams.");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 4: target customer / ICP.
      await page.getByRole("textbox").fill("Finance leads at seed-stage SaaS companies");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 5: stage (single-select chip group).
      await page.getByRole("button", { name: "Idea", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 6: channels tried (multi-select chip group) — pick one.
      await page.getByRole("button", { name: "Cold email", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 7: customers today.
      await page.getByRole("spinbutton").fill("0");
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 8: hours a week (single-select chip group; note the en dash).
      await page.getByRole("button", { name: "3–5", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      // Step 9: review and submit.
      await page.getByRole("button", { name: "Start my quest log" }).click();
      await expect(page).toHaveURL(/\/dashboard/);
    });

    await test.step("dashboard shows the Growth HUD and logs a customer", async () => {
      await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
      await expect(page.getByText("100 more to your first 100")).toBeVisible();

      await page.getByRole("button", { name: "+ I got a new customer" }).click();
      await expect(page.getByText("99 more to your first 100")).toBeVisible();
    });

    await test.step("accepts a suggested quest", async () => {
      await page.goto("/quests");
      await expect(page.getByRole("heading", { name: "Quests" })).toBeVisible();

      const acceptButton = page.getByRole("button", { name: "Accept" }).first();
      await expect(acceptButton).toBeVisible();
      await acceptButton.click();

      await expect(page.getByText("Active (1 of 3)")).toBeVisible();
    });

    await test.step("settings reflects the onboarding profile", async () => {
      await page.goto("/settings");
      await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
      await expect(page.getByLabel("Company name")).toHaveValue("Acme Analytics");
      await expect(page.getByLabel("Industry")).toHaveValue("SaaS");
    });

    await test.step("logs out", async () => {
      await page.goto("/dashboard");
      await page.getByRole("button", { name: "Log out" }).click();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
