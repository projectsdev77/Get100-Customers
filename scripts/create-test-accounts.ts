// One-off dev convenience: creates a normal founder test account and an
// admin test account against your live Supabase project, so you don't have
// to sign up + hand-edit admin_users through the SQL editor yourself
// (SETUP.md §10). Safe to re-run — it reuses an existing user by email
// instead of erroring, and the admin_users upsert is idempotent.
//
//   npx tsx scripts/create-test-accounts.ts
//
// Override the defaults with env vars if you want different
// emails/passwords: TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_ADMIN_EMAIL,
// TEST_ADMIN_PASSWORD.
import "dotenv/config";
import { createAdminClient } from "../src/lib/supabase/admin";

const USER_EMAIL = process.env.TEST_USER_EMAIL ?? "founder@test.local";
const USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? "TestPassword123!";
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@test.local";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "TestPassword123!";

async function findOrCreateUser(admin: ReturnType<typeof createAdminClient>, email: string, password: string) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listError) throw new Error(`Failed to list users: ${listError.message}`);

  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    console.log(`  Already exists — reusing ${email}`);
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`Failed to create ${email}: ${error?.message}`);
  console.log(`  Created ${email}`);
  return data.user.id;
}

async function main() {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing env vars: ${missing.join(", ")}. Fill in .env.local first (SETUP.md §1).`);
    process.exit(1);
  }

  const admin = createAdminClient();

  console.log("Normal founder account:");
  await findOrCreateUser(admin, USER_EMAIL, USER_PASSWORD);

  console.log("\nAdmin account:");
  const adminUserId = await findOrCreateUser(admin, ADMIN_EMAIL, ADMIN_PASSWORD);

  const { error: adminUpsertError } = await admin
    .from("admin_users")
    .upsert({ auth_user_id: adminUserId, role: "owner" }, { onConflict: "auth_user_id" });
  if (adminUpsertError) {
    throw new Error(`Failed to grant admin role: ${adminUpsertError.message}`);
  }
  console.log("  Granted admin_users role: owner");

  console.log(`
Done. Log in at http://localhost:3000/login with either account:

  Normal user  ->  ${USER_EMAIL} / ${USER_PASSWORD}
                   (goes through onboarding like any new founder)

  Admin user   ->  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}
                   (also has a normal founder account, but can visit
                   /admin to see the founders list and support tools)
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
