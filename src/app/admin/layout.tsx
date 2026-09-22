import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/is-admin";

// Single gate for every /admin/* route (SPEC §12 — internal-only, gated by
// admin_users). Pages under here assume access already granted and use
// the service-role admin client directly for cross-founder data, since
// RLS on founders/etc. stays scoped to auth.uid() regardless of admin
// status (see src/lib/admin/is-admin.ts).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  if (!(await isCurrentUserAdmin(supabase))) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <nav className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <span className="font-semibold text-black dark:text-zinc-50">Admin</span>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
