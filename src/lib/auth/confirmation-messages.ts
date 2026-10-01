import type { AuthError } from "@supabase/supabase-js";

// Shared between /auth/callback (Google OAuth + PKCE `code` exchange) and
// /auth/confirm (token_hash + type verifyOtp, for email-based
// confirmations like signup and email-change) since both need the same
// per-flow failure copy and redirect targeting.
export const FLOW_ERROR_MESSAGES: Record<string, string> = {
  login: "Could not sign in with Google.",
  signup: "That confirmation link didn't work — it may have expired or already been used. Try signing up again.",
  email_change:
    "That confirmation link didn't work — it may have expired or already been used. Try changing your email again.",
};

// Confirming an email change to an address another account already uses
// fails here with this specific, documented Supabase error code — worth
// naming outright rather than folding into the generic "link didn't work"
// message above, since the fix (pick a different email) is completely
// different from "try again."
export function errorMessage(flow: string, error: AuthError): string {
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
export function failureRedirectUrl(origin: string, flow: string, next: string, message: string): string {
  const path = flow === "email_change" ? next : "/login";
  const url = new URL(path, origin);
  url.searchParams.set("error", message);
  return url.toString();
}

export const EMAIL_CHANGE_HALF_CONFIRMED_MESSAGE =
  "Confirmed — now open your other email (old or new, whichever you haven't clicked yet) and confirm that link too. The change only applies once both are done.";

// Secure email change (Supabase's project default) requires confirming
// from BOTH the old and new address before the swap actually applies.
// Confirming just one side comes back from Supabase as a genuine success
// (no error) but with no user/session yet, since the change isn't
// complete — confirmed directly in @supabase/auth-js's source
// (lib/fetch.ts's _sessionResponse: "Some /verify responses (e.g. secure
// email_change first-confirmation) return only { msg, code } with no user
// and no session"). Previously both callers here folded that into the
// generic failure message, telling the founder their own successful click
// "didn't work" when the only thing left was clicking the other email's
// link too.
export function halfConfirmedRedirectUrl(origin: string, next: string): string {
  const url = new URL(next, origin);
  url.searchParams.set("notice", EMAIL_CHANGE_HALF_CONFIRMED_MESSAGE);
  return url.toString();
}
