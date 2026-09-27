import "dotenv/config";
import { createAdminClient } from "../src/lib/supabase/admin";
import { TEST_EMAIL, TEST_PASSWORD } from "./test-user";

// Runs once before the suite. Creates a fresh, pre-confirmed test founder
// via the Supabase admin API — real signup goes through email confirmation
// (see src/app/(auth)/actions.ts), which a headless test can't click
// through, so this bypasses it the same way an admin-provisioned account
// would. Deleting any pre-existing test user first (which cascades through
// founders/quests/etc per supabase/schema.sql's `on delete cascade`) makes
// each run start from the same brand-new-founder state regardless of what
// a previous run left behind.
export default async function globalSetup() {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `e2e global setup: missing env vars: ${missing.join(", ")}. ` +
        "These tests hit a real Supabase project — see SETUP.md.",
    );
  }

  const admin = createAdminClient();

  const { data: existing, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) {
    throw new Error(`e2e global setup: failed to list users — ${listError.message}`);
  }

  const match = existing.users.find((u) => u.email === TEST_EMAIL);
  if (match) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(match.id);
    if (deleteError) {
      throw new Error(`e2e global setup: failed to delete stale test user — ${deleteError.message}`);
    }
  }

  const { error: createError } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (createError) {
    throw new Error(`e2e global setup: failed to create test user — ${createError.message}`);
  }
}
