"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin/is-admin";
import { fillNextQuestSlot } from "@/lib/quests/lifecycle";
import { sendEmail } from "@/lib/email/resend";
import type { Founder, SubscriptionStatus } from "@/types/database";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

// A direct support-to-founder message, not a "resend" of a past
// notification — the email channel only ever logs its subject line, not
// the full HTML body (see notify.ts), so there's nothing stored to
// literally replay. Always logs in-app regardless of the founder's email
// preferences, and emails too (if requested) regardless of their
// per-category toggles — this is a direct support contact the founder
// didn't opt in/out of as a category, not an automated notification type.
export async function adminSendMessage(formData: FormData) {
  await requireAdmin();
  const founderId = String(formData.get("founderId"));
  const message = String(formData.get("message") || "").trim();
  if (!message) return;
  const alsoEmail = formData.get("sendEmail") === "on";

  const admin = createAdminClient();
  const { error: logError } = await admin.from("notifications_log").insert({
    founder_id: founderId,
    type: "admin_message",
    channel: "in_app",
    message,
  });
  if (logError) {
    console.error(`adminSendMessage: failed to log in-app message for founder ${founderId}:`, logError);
  }

  let emailSent = false;
  if (alsoEmail) {
    const { data: founder } = await admin
      .from("founders")
      .select("auth_user_id")
      .eq("id", founderId)
      .single<{ auth_user_id: string }>();
    const { data: authUser } = founder
      ? await admin.auth.admin.getUserById(founder.auth_user_id)
      : { data: null };
    const email = authUser?.user?.email;

    if (email) {
      const subject = "A message from the Get100-Customers team";
      emailSent = await sendEmail(email, subject, `<p>${escapeHtml(message)}</p>`);
      if (emailSent) {
        await admin.from("notifications_log").insert({
          founder_id: founderId,
          type: "admin_message",
          channel: "email",
          message: subject,
        });
      }
    }
  }

  revalidatePath(`/admin/founders/${founderId}`);
  const flash = !alsoEmail
    ? "Message sent (in-app)."
    : emailSent
      ? "Message sent (in-app and email)."
      : "Message sent in-app, but the email failed to send — check Vercel's logs (sendEmail) for why.";
  redirect(`/admin/founders/${founderId}?flash=${encodeURIComponent(flash)}`);
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
