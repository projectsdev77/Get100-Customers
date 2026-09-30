"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";

// Marks one quest-linked notification read at the moment it's actually
// used to navigate somewhere — these don't get swept up by
// markOthersRead, since clicking through *is* the read signal for them.
export async function openNotification(notificationId: string, href: string) {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) redirect("/login");

  await supabase
    .from("notifications_log")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("founder_id", founder.id);

  // Revalidates TopNav's unread badge (rendered in the shared layout, not
  // this page) — without this, redirect() alone can leave the client
  // router serving a cached copy of the layout with the pre-read count.
  revalidatePath("/", "layout");
  redirect(href);
}

// Marks every notification without a click-through target (announcements,
// re_engagement) read, fired from a tiny client effect the moment
// /notifications is viewed (see auto-mark-read.tsx) — there's no visible
// button for this, but it still has to be a real Server Action rather than
// a plain write inside the page's render, since revalidatePath is only
// legal from an action or route handler, and the layout's badge needs it.
export async function markOthersRead(ids: string[]) {
  if (ids.length === 0) return;

  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) return;

  await supabase
    .from("notifications_log")
    .update({ read_at: new Date().toISOString() })
    .in("id", ids)
    .eq("founder_id", founder.id);

  revalidatePath("/", "layout");
}
