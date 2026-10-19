"use server";

import { createClient } from "@/lib/supabase/server";
import { isValidTimeZone } from "@/lib/founders/timezone";

// Only fills an empty timezone, so a choice made in Settings is never
// overwritten by whatever browser the founder happens to be on.
export async function saveDetectedTimezone(timeZone: string) {
  if (!isValidTimeZone(timeZone)) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("founders")
    .update({ timezone: timeZone })
    .eq("auth_user_id", user.id)
    .is("timezone", null);
}
