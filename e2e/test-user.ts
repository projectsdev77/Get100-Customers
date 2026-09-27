// Shared identity for the e2e test founder. global-setup.ts (re)creates
// this account fresh before each run, and golden-path.spec.ts logs in as
// it — override via env if you need to point at a specific seeded account
// instead of letting global setup manage the lifecycle.
export const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e-test@example.com";
export const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "TestPassword123!";
