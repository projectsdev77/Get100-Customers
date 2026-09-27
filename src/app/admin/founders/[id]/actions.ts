"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin/is-admin";
import type { SubscriptionStatus } from "@/types/database";

const VALID_STATUSES: SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
  "restricted",
  "canceled",
];

async function requireAdmin() {
  const supabase = await createClient();
  const ok = await isCurrentUserAdmin(supabase);
  if (!ok) throw new Error("Not authorized");
}

// Support-tool overrides (SPEC §12) — both bypass RLS via the admin
// client since this founder isn't the one making the request.
export async function adminCorrectCustomerCount(formData: FormData) {
  await requireAdmin();
  const founderId = String(formData.get("founderId"));
  const newCount = Math.max(0, parseInt(String(formData.get("count") || "0"), 10) || 0);

  const admin = createAdminClient();
  const { data: founder } = await admin
    .from("founders")
    .select("current_customer_count")
    .eq("id", founderId)
    .single<{ current_customer_count: number }>();
  if (!founder) return;

  const delta = newCount - founder.current_customer_count;
  if (delta !== 0) {
    await admin.from("customer_events").insert({
      founder_id: founderId,
      event_type: "corrected",
      delta,
      note: "Admin override",
    });
    await admin.from("founders").update({ current_customer_count: newCount }).eq("id", founderId);
  }

  revalidatePath(`/admin/founders/${founderId}`);
}

export async function adminUpdateSubscriptionStatus(formData: FormData) {
  await requireAdmin();
  const founderId = String(formData.get("founderId"));
  const status = String(formData.get("status"));
  if (!VALID_STATUSES.includes(status as SubscriptionStatus)) return;

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .upsert(
      { founder_id: founderId, status, updated_at: new Date().toISOString() },
      { onConflict: "founder_id" },
    );

  revalidatePath(`/admin/founders/${founderId}`);
}
