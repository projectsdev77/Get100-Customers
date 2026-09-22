"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";

// Manual self-report, independent of any quest (SPEC §8/§14 — "founder
// marks a quest OR a standalone action as resulting in a new customer").
export async function logCustomer() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase.from("customer_events").insert({
    founder_id: founder.id,
    event_type: "reported",
    delta: 1,
    note: "Manually logged from dashboard",
  });

  await supabase
    .from("founders")
    .update({ current_customer_count: founder.current_customer_count + 1 })
    .eq("id", founder.id);

  revalidatePath("/dashboard");
}

// Correcting the count handles both mistakes and real churn (SPEC §14) —
// sets an absolute total rather than a delta, since that's what a founder
// actually knows ("I have 23 customers", not "I lost 2").
export async function correctCustomerCount(formData: FormData) {
  const newCount = Math.max(0, parseInt(String(formData.get("count") || "0"), 10) || 0);

  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  const delta = newCount - founder.current_customer_count;
  if (delta === 0) return;

  await supabase.from("customer_events").insert({
    founder_id: founder.id,
    event_type: "corrected",
    delta,
    note: `Corrected from ${founder.current_customer_count} to ${newCount}`,
  });

  await supabase
    .from("founders")
    .update({ current_customer_count: newCount })
    .eq("id", founder.id);

  revalidatePath("/dashboard");
}
