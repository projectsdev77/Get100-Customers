import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely. Only for system-generated
// writes that don't belong to a logged-in founder's session (notification
// creation, the weekly recap cron iterating every founder, looking up a
// founder's email via the Auth admin API). Never import this into a
// founder-facing request path that should stay RLS-scoped.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
