import { AuthApiError, AuthWeakPasswordError, type AuthError } from "@supabase/supabase-js";

// Only show a Supabase auth error to the founder verbatim when it's a
// real response from the Auth API about their credentials (wrong
// password, unconfirmed email, rate limited, weak password, etc.) —
// those are safe and actually help them. Anything else — the project
// being unreachable, a DNS/network failure, a timeout — comes back as
// an AuthRetryableFetchError/AuthUnknownError with messages like "fetch
// failed", which is an implementation detail, not something a user
// should ever see. Falls back to a generic message for those instead.
export function authErrorMessage(error: AuthError): string {
  if (error instanceof AuthApiError || error instanceof AuthWeakPasswordError) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
