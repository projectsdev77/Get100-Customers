"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";

export async function markAllRead() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase
    .from("notifications_log")
    .update({ read_at: new Date().toISOString() })
    .eq("founder_id", founder.id)
    .is("read_at", null);

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
