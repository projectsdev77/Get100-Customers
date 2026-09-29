import type { Page } from "@playwright/test";
import { createAdminClient } from "../src/lib/supabase/admin";

// Shared setup for the checklist-automation specs (security, quest-lifecycle,
// pattern-detection, onboarding-flow, settings, admin, notifications,
// billing). Unlike golden-path.spec.ts's single shared TEST_EMAIL founder,
// each of these specs needs its own isolated founder(s) — several seed
// specific quest/growth-profile/subscription state directly via the admin
// client, and sharing one account across files would make one spec's seeded
// state bleed into another's assertions (the suite runs with workers: 1 and
// fullyParallel: false, so it's not a race, but it's still shared mutable
// state across files run in the same pass).
export const adminClient = createAdminClient();

export interface TestFounder {
  email: string;
  password: string;
  founderId: string;
  authUserId: string;
}

const TEST_PASSWORD = "TestPassword123!";

// completeProfile fills in industry/product_description (the two fields
// dashboard.tsx's profileComplete check requires) so the founder lands
// straight on /dashboard instead of being redirected to /onboarding — pass
// completeProfile: false for tests that need to drive the onboarding wizard
// itself.
export async function createTestFounder(
  label: string,
  { completeProfile = true, overrides = {} as Record<string, unknown> } = {},
): Promise<TestFounder> {
  const email = `e2e-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`createTestFounder(${label}): failed to create auth user — ${error?.message}`);
  }
  const authUserId = data.user.id;

  // handle_new_founder (supabase/schema.sql) creates the founders row via a
  // database trigger on auth.users insert — poll briefly rather than assume
  // it's already visible the instant createUser() resolves.
  let founderId: string | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data: founder } = await adminClient
      .from("founders")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (founder) {
      founderId = founder.id;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!founderId) {
    throw new Error(`createTestFounder(${label}): founders row never appeared for ${email}`);
  }

  // Login always redirects to /dashboard when the profile is already
  // complete (and onboarding completion redirects there too once it's
  // finished) — and /dashboard's refreshQuestLog tries a live AI quest
  // generation whenever zero "suggested" quests exist. Seeding one
  // unconditionally here means every test founder is immune to that,
  // regardless of what the test actually cares about — found the hard way
  // against a live run where Gemini's daily quota was exhausted and Groq
  // was also returning 503s, making that live call take 10-30+s per
  // attempt and blow past normal assertion timeouts.
  const { error: seedQuestError } = await adminClient.from("quests").insert({
    founder_id: founderId,
    title: "A quest waiting to be picked up",
    category: "paid",
    status: "suggested",
  });
  if (seedQuestError) {
    throw new Error(`createTestFounder(${label}): failed to seed placeholder quest — ${seedQuestError.message}`);
  }

  if (completeProfile) {
    const { error: updateError } = await adminClient
      .from("founders")
      .update({
        company_name: `E2E ${label}`,
        industry: "SaaS",
        product_description: "A test product used only for e2e coverage.",
        icp: "Test customers",
        stage: "launched",
        weekly_hours: "3-5",
        current_customer_count: 0,
        ...overrides,
      })
      .eq("id", founderId);
    if (updateError) {
      throw new Error(`createTestFounder(${label}): failed to complete profile — ${updateError.message}`);
    }
  } else if (Object.keys(overrides).length > 0) {
    const { error: updateError } = await adminClient.from("founders").update(overrides).eq("id", founderId);
    if (updateError) {
      throw new Error(`createTestFounder(${label}): failed to apply overrides — ${updateError.message}`);
    }
  }

  return { email, password: TEST_PASSWORD, founderId, authUserId };
}

// Deletes the auth user, which cascades through founders/quests/etc per
// supabase/schema.sql's `on delete cascade` — call this in a `finally` so a
// failed assertion doesn't leave the test account behind.
export async function deleteTestFounder(authUserId: string): Promise<void> {
  await adminClient.auth.admin.deleteUser(authUserId);
}

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  // Not getByLabel("Password") — PasswordInput (src/components/ui/forms/
  // PasswordInput.tsx) wraps the input AND its "Show password" toggle
  // button inside one label, so the field's computed accessible name is
  // "Password Show password" and the toggle button's own name is "Show
  // password" — both contain "password" as a substring, so getByLabel
  // matches two elements and Playwright refuses to guess which one.
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  // The login action redirects to /dashboard or /onboarding depending on
  // profile completeness — wait for navigation away from /login rather
  // than a fixed destination, or the caller's next page.goto()/click can
  // interrupt the in-flight redirect before the session is actually
  // established (observed live: an immediate goto("/admin") right after
  // this click landed back on /login?next=%2Fadmin instead of being
  // treated as authenticated).
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}
