"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin/is-admin";
import { fillNextQuestSlot } from "@/lib/quests/lifecycle";
import type { Founder, SubscriptionStatus } from "@/types/database";

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

// Force-fills a "suggested" slot right now rather than waiting for the
// founder's next page load — a real support need (e.g. "I just fixed my
// payment but nothing's loading yet"). Deliberately bypasses the
// restriction check ensureQuestSlots normally enforces (fillNextQuestSlot
// is that function's shared core, split out for exactly this override —
// see src/lib/quests/lifecycle.ts) since this is a support action, not a
// loophole reachable by the founder themselves.
export async function adminGenerateQuest(formData: FormData) {
  await requireAdmin();
  const founderId = String(formData.get("founderId"));

  const admin = createAdminClient();
  const { data: founder } = await admin
    .from("founders")
    .select("*")
    .eq("id", founderId)
    .single<Founder>();
  if (!founder) return;

  const inserted = await fillNextQuestSlot(admin, founder);

  revalidatePath(`/admin/founders/${founderId}`);
  redirect(
    `/admin/founders/${founderId}?flash=${encodeURIComponent(
      inserted
        ? "Generated a new quest."
        : "No new quest generated — they may already have one suggested, or generation failed. Try again in a moment.",
    )}`,
  );
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
