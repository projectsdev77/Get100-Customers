import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { REMEMBER_ME_COOKIE, stripPersistence } from "@/lib/auth/session-persistence";

// Server-side Supabase client (Server Components, Route Handlers).
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// (see .env.example, PHASES.md Phase 1).
export async function createClient() {
  const cookieStore = await cookies();
  const dontPersist = cookieStore.get(REMEMBER_ME_COOKIE)?.value === "0";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, dontPersist ? stripPersistence(options) : options),
            );
          } catch {
            // setAll called from a Server Component — safe to ignore when
            // proxy.ts is refreshing sessions.
          }
        },
      },
    },
  );
}
