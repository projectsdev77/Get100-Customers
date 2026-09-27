import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Checked via the founder's own RLS-scoped session (admin_users' only
// policy is self-select, supabase/schema.sql) — this can only ever confirm
// "am I an admin," never enumerate other admins. Actual cross-founder data
// access after this passes still needs the service-role admin client,
// since founders/etc. RLS is scoped to auth.uid() regardless of admin
// status.
export async function isCurrentUserAdmin(supabase: SupabaseServerClient): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}
