import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/is-admin";
import { logout } from "../(auth)/actions";

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
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-3.5">
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-primary">
          Get100-Customers <span className="font-medium text-secondary">/ Admin</span>
        </span>
        {/*
          An admin account's founder profile is never filled in (SPEC §12
          — it's an internal-only role, not a real product user), so
          there was previously no way out of here: /dashboard would bounce
          straight to /onboarding, same bug the login redirect fix
          addressed, just hit mid-session instead of at sign-in.
        */}
        <form action={logout}>
          <button
            type="submit"
            className="h-9 px-3.5 text-sm font-medium text-secondary transition-colors duration-200 hover:text-primary"
          >
            Log out
          </button>
        </form>
      </nav>
      <main className="mx-auto max-w-[1120px] px-6 py-10">{children}</main>
    </div>
  );
}
