import { test, expect } from "@playwright/test";
import { createTestFounder, deleteTestFounder, loginAs, adminClient } from "./helpers";

// Checklist items "admin access control" and "support overrides" — the gate
// itself (admin_users, self-select RLS) and the override form on a
// founder's detail page (src/app/admin/founders/[id]/page.tsx).
test.describe("admin", () => {
  test("admin sees the founders list; a non-admin founder is redirected away from /admin", async ({
    page,
  }) => {
    const admin = await createTestFounder("admin-user");
    const regular = await createTestFounder("admin-regular");

    try {
      const { error: adminInsertError } = await adminClient
        .from("admin_users")
        .insert({ auth_user_id: admin.authUserId, role: "support" });
      expect(adminInsertError).toBeNull();

      await loginAs(page, regular.email, regular.password);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/dashboard/);
      await page.getByRole("button", { name: "Log out" }).click();

      await loginAs(page, admin.email, admin.password);
      await page.goto("/admin");
      await expect(page.getByText("/ Admin")).toBeVisible();
      await expect(page.getByText("E2E admin-regular")).toBeVisible();
    } finally {
      await deleteTestFounder(admin.authUserId);
      await deleteTestFounder(regular.authUserId);
    }
  });

  test("a support override updates a founder's customer count", async ({ page }) => {
    const admin = await createTestFounder("admin-override-admin");
    const target = await createTestFounder("admin-override-target");

    try {
      await adminClient.from("admin_users").insert({ auth_user_id: admin.authUserId, role: "support" });

      await loginAs(page, admin.email, admin.password);
      await page.goto(`/admin/founders/${target.founderId}`);
      await expect(page.getByRole("heading", { name: `E2E admin-override-target` })).toBeVisible();

      const overrideForm = page.locator("form", { has: page.getByLabel("Customer count") });
      await overrideForm.getByLabel("Customer count").fill("42");
      await overrideForm.getByRole("button", { name: "Save" }).click();

      // adminCorrectCustomerCount has no visible "saved" confirmation and
      // only revalidatePath()s the current page rather than redirecting —
      // an immediate second page.goto() here raced the server action
      // (same shape as the earlier login-navigation race) and read stale
      // data before the write landed. Asserting in place instead lets
      // Playwright's own auto-retry wait out the revalidation.
      await expect(page.getByLabel("Customer count")).toHaveValue("42");
    } finally {
      await deleteTestFounder(admin.authUserId);
      await deleteTestFounder(target.authUserId);
    }
  });
});
