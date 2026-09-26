"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { appendStrategyHistory } from "@/lib/growth-profile/append-strategy-history";
import { isPasswordValid } from "@/lib/auth/password";
import { hasIdentityProvider } from "@/lib/auth/find-user-by-email";
import { authErrorMessage } from "@/lib/auth/error-message";
import type {
  EmailNotificationPrefs,
  FounderStage,
  Founder,
  NotificationType,
  WeeklyHours,
} from "@/types/database";

const VALID_STAGES: FounderStage[] = ["idea", "prototype", "launched"];
const VALID_WEEKLY_HOURS: WeeklyHours[] = ["1-2", "3-5", "6-10", "10+"];
const NOTIFICATION_TYPES: NotificationType[] = [
  "new_quest",
  "window_approaching",
  "re_engagement",
  "milestone",
  "weekly_recap",
];

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in." };
  }

  const { data: before } = await supabase
    .from("founders")
    .select("id, industry, product_description")
    .eq("auth_user_id", user.id)
    .single<Pick<Founder, "id" | "industry" | "product_description">>();

  const stage = String(formData.get("stage") || "");
  const weeklyHours = String(formData.get("weekly_hours") || "");
  const channelsRaw = formData.getAll("channels_tried").map(String).filter(Boolean);
  const newIndustry = String(formData.get("industry") || "") || null;
  const newProductDescription = String(formData.get("product_description") || "") || null;

  const { error } = await supabase
    .from("founders")
    .update({
      name: String(formData.get("name") || "") || null,
      company_name: String(formData.get("company_name") || "") || null,
      industry: newIndustry,
      product_description: newProductDescription,
      icp: String(formData.get("icp") || "") || null,
      stage: VALID_STAGES.includes(stage as FounderStage) ? stage : null,
      weekly_hours: VALID_WEEKLY_HOURS.includes(weeklyHours as WeeklyHours) ? weeklyHours : null,
      channels_tried: channelsRaw,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // A materially changed industry or product description is a pivot
  // (SPEC §5/§14) — logged for future coaching, XP/level/customer count
  // untouched since they represent the founder's overall journey, not
  // just the current idea framing. Non-blocking: the UI offers, not
  // forces, a revisit to onboarding.
  let pivotDetected = false;
  if (before) {
    const industryChanged = Boolean(before.industry) && before.industry !== newIndustry;
    const productChanged =
      Boolean(before.product_description) && before.product_description !== newProductDescription;
    if (industryChanged || productChanged) {
      pivotDetected = true;
      await appendStrategyHistory(
        before.id,
        `Profile pivot: industry "${before.industry}" → "${newIndustry}", product "${before.product_description}" → "${newProductDescription}".`,
      );
    }
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true, pivotDetected };
}

// Verifies the current password ourselves (rather than relying on
// Supabase's own optional GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD
// project setting, which this app doesn't control) by attempting a real
// sign-in with it before applying the change. A founder who signed up
// via Google only has no password identity at all yet, so there's
// nothing to verify — this lets them set one for the first time instead.
export async function changePassword(formData: FormData) {
  const currentPassword = String(formData.get("current_password") || "");
  const newPassword = String(formData.get("new_password") || "");

  if (!isPasswordValid(newPassword)) {
    return {
      error:
        "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not signed in." };

  if (hasIdentityProvider(user, "email")) {
    if (!currentPassword) {
      return { error: "Enter your current password." };
    }
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      return { error: "Current password is incorrect." };
    }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: authErrorMessage(error) };

  return { success: true as const };
}

// Supabase's "Secure email change" (the project default) requires
// confirming from both the new address and the current one before the
// change applies, so this only ever starts the process — nothing
// changes here until those links are clicked. Reuses /auth/callback
// (same PKCE code exchange Google OAuth and signup confirmation already
// use) rather than a dedicated route.
export async function changeEmail(formData: FormData) {
  const newEmail = String(formData.get("email") || "").trim();
  if (!newEmail) return { error: "Enter a new email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent("/settings")}`,
    },
  );
  if (error) return { error: authErrorMessage(error) };

  return { success: true as const };
}

// Revokes every refresh token for this user (scope: "global"), not just
// the current session — the practical version of "session management"
// this app can actually offer without a custom session/device-tracking
// table, which Supabase's client SDK doesn't expose on its own.
export async function signOutEverywhere() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}

// In-app notifications stay always on (core to the game UI, SPEC §11);
// this only toggles the email channel per category. Plain form action (no
// useActionState consumer), so this returns void like the other simple
// actions in this app rather than a result object.
export async function updateNotificationPrefs(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const prefs = NOTIFICATION_TYPES.reduce((acc, type) => {
    acc[type] = formData.get(`pref_${type}`) === "on";
    return acc;
  }, {} as EmailNotificationPrefs);

  await supabase
    .from("founders")
    .update({ email_notification_prefs: prefs, updated_at: new Date().toISOString() })
    .eq("auth_user_id", user.id);

  revalidatePath("/settings");
}

// Account deletion (SPEC §13 privacy baseline). Deleting the auth.users
// row cascades through every founder-owned table via `on delete cascade`
// (supabase/schema.sql) — founders, quests, quest_results,
// customer_events, growth_profiles, subscriptions, notifications_log,
// founder_documents all go with it. Requires the founder to type DELETE
// to confirm, since this is irreversible.
export async function deleteAccount(formData: FormData) {
  const confirmation = String(formData.get("confirmation") || "");
  if (confirmation !== "DELETE") {
    return { error: 'Type "DELETE" to confirm.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await createAdminClient().auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
  redirect("/");
}
