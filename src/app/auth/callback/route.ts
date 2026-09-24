import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google (and any future OAuth provider) redirects here with a `code` after
// the founder approves on Google's consent screen. Exchanging it for a
// session here — rather than client-side — lets the Supabase SSR client
// set the session cookie directly on the response, same as email/password
// login. The `handle_new_founder` trigger (supabase/schema.sql) provisions
// the founders/subscriptions rows on first sign-in regardless of provider,
// so no separate first-time-Google-user handling is needed here.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Could not sign in with Google.")}`,
  );
}
