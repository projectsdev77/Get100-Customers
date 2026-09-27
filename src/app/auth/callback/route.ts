import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// A brand-new Google account's first-ever sign-in has last_sign_in_at
// essentially equal to created_at (Supabase sets both on account
// creation). An existing account signing in again has a last_sign_in_at
// far later than its original created_at. There's no direct "is this a
// new user" flag on the session, so this timing gap is the standard way
// to tell them apart.
function isBrandNewAccount(user: { created_at: string; last_sign_in_at?: string | null }): boolean {
  if (!user.last_sign_in_at) return true;
  const createdAt = new Date(user.created_at).getTime();
  const lastSignInAt = new Date(user.last_sign_in_at).getTime();
  return Math.abs(lastSignInAt - createdAt) < 10_000;
}

// Google (and any future OAuth provider) redirects here with a `code` after
// the founder approves on Google's consent screen. Exchanging it for a
// session here — rather than client-side — lets the Supabase SSR client
// set the session cookie directly on the response, same as email/password
// login. The `handle_new_founder` trigger (supabase/schema.sql) provisions
// the founders/subscriptions rows on first sign-in regardless of provider.
//
// "flow=login" means the founder clicked "Continue with Google" on
// /login, which should only ever sign an EXISTING founder in — Google
// OAuth otherwise happily creates a new account on the spot, which would
// let someone "log in" to an account that never existed. If this turns
// out to be a brand-new account, undo it fully: exchangeCodeForSession
// already created the auth.users row before we ever get a chance to
// look at it, so signing out alone would leave a real, permanent ghost
// account squatting on that email — silently blocking that person from
// ever signing up with it again, and from ever seeing this "brand new"
// path a second time (their own ghost account would just look like an
// existing one). Delete it outright instead.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";
  const flow = searchParams.get("flow") || "signup";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (flow === "login" && isBrandNewAccount(data.user)) {
        await supabase.auth.signOut();
        await createAdminClient().auth.admin.deleteUser(data.user.id);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(
            "You don't have an account with this Google account. Sign up instead.",
          )}`,
        );
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Could not sign in with Google.")}`,
  );
}
