"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { appendStrategyHistory } from "@/lib/growth-profile/append-strategy-history";
import type { EmailNotificationPrefs, FounderStage, Founder, NotificationType } from "@/types/database";

const VALID_STAGES: FounderStage[] = ["idea", "prototype", "launched"];
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
  const channelsRaw = String(formData.get("channels_tried") || "");
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
      channels_tried: channelsRaw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
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
