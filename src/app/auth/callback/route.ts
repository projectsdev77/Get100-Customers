import { NextResponse } from "next/server";
import type { AuthError, EmailOtpType } from "@supabase/supabase-js";
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
// This route's failure message used to be a single hardcoded "Could not
// sign in with Google" — fine for the OAuth flow it was written for, but
// this same route also handles signup and email-change confirmation
// links (all three redirect here with a PKCE `code`), so that message
// falsely blamed Google for, say, a failed email-change confirmation.
// A likely real cause for that one specifically: PKCE code exchange needs
// a verifier stored by whichever browser/tab originally requested the
// change, so a confirmation link opened in a different browser context
// (common for email links) fails here even though nothing is actually
// wrong with the account.
const FLOW_ERROR_MESSAGES: Record<string, string> = {
  login: "Could not sign in with Google.",
  signup:
    "That confirmation link didn't work — it may have expired, already been used, or been opened in a different browser than you requested it from. Try signing up again.",
  email_change:
    "That confirmation link didn't work — it may have expired, already been used, or been opened in a different browser than you requested it from. Try changing your email again.",
};

// Confirming an email change to an address another account already uses
// fails here with this specific, documented Supabase error code — worth
// naming outright rather than folding into the generic "link didn't work"
// message above, since the fix (pick a different email) is completely
// different from "try again."
function errorMessage(flow: string, error: AuthError): string {
  if (flow === "email_change" && error.code === "email_exists") {
    return "That email is already used by another account. Try a different one.";
  }
  return FLOW_ERROR_MESSAGES[flow] ?? "Something went wrong. Please try again.";
}

// Where to send the founder on failure: an email-change confirmation
// happens to someone who's typically still signed in elsewhere in the
// same browser, so bouncing them to /login is jarring and pointless —
// send them back to where they started instead. Login/signup failures
// still belong on /login, since there's no existing session to return to.
// Built via URL rather than string concatenation since `next` (e.g.
// "/settings?tab=account") can already carry its own query string.
function failureRedirectUrl(origin: string, flow: string, next: string, message: string): string {
  const path = flow === "email_change" ? next : "/login";
  const url = new URL(path, origin);
  url.searchParams.set("error", message);
  return url.toString();
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/dashboard";
  // Supabase's own `type` param (present on the token_hash path below) is
  // more reliable than our own `flow` param for telling flows apart, since
  // it comes straight from the confirmation link Supabase generated rather
  // than something we appended ourselves — use it when present.
  const flow = otpType === "email_change" ? "email_change" : searchParams.get("flow") || "signup";

  // Supabase's default confirmation-email format: a token verified purely
  // server-side against the token itself, no PKCE code_verifier required —
  // so unlike the `code` path below, this works even when the link is
  // opened on a different browser/device than the one that requested the
  // change, which is the normal case for a link delivered by email. Only
  // reaches this branch once the Supabase dashboard's email templates are
  // changed to link with token_hash/type (e.g.
  // "{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change&next=/settings")
  // instead of the default {{ .ConfirmationURL }} redirect chain, which
  // always routes through Supabase's own hosted /verify endpoint and a
  // fresh PKCE code requiring the originating browser's verifier. That's a
  // dashboard config change, not something this code alone controls.
  if (tokenHash && otpType) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type: otpType, token_hash: tokenHash });

    if (!error && data.user) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const message = error
      ? errorMessage(flow, error)
      : (FLOW_ERROR_MESSAGES[flow] ?? "Something went wrong. Please try again.");
    return NextResponse.redirect(failureRedirectUrl(origin, flow, next, message));
  }

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

    if (error) {
      return NextResponse.redirect(failureRedirectUrl(origin, flow, next, errorMessage(flow, error)));
    }
  }

  const message = FLOW_ERROR_MESSAGES[flow] ?? "Something went wrong. Please try again.";
  return NextResponse.redirect(failureRedirectUrl(origin, flow, next, message));
}
