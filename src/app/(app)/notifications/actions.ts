"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";

// Marks one quest-linked notification read at the moment it's actually
// used to navigate somewhere — these don't get swept up by the
// mark-everything-else-read-on-view behavior in page.tsx, since clicking
// through *is* the read signal for them.
export async function openNotification(notificationId: string, href: string) {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) redirect("/login");

  await supabase
    .from("notifications_log")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("founder_id", founder.id);

  redirect(href);
}
