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
    <div className="min-h-screen bg-canvas">
      <nav className="mx-auto max-w-[1120px] px-6 py-3.5">
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-primary">
          Get100-Customers <span className="font-medium text-secondary">/ Admin</span>
        </span>
      </nav>
      <main className="mx-auto max-w-[1120px] px-6 py-10">{children}</main>
    </div>
  );
}
