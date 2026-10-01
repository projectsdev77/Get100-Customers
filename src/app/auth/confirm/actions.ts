"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  errorMessage,
  failureRedirectUrl,
  halfConfirmedRedirectUrl,
  FLOW_ERROR_MESSAGES,
} from "@/lib/auth/confirmation-messages";

// Only called from a real button press (confirm-form.tsx), never from a
// page load — see the comment on ConfirmEmailPage for why that matters.
// verifyOtp needs no client-stored secret (unlike the PKCE `code` exchange
// /auth/callback uses), so this works even when the token was generated
// in a different browser/device than the one confirming it here.
export async function confirmEmailToken(tokenHash: string, type: EmailOtpType, next: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  const flow = type === "email_change" ? "email_change" : "signup";

  if (!error && data.user) {
    redirect(next);
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL!;

  // See halfConfirmedRedirectUrl's comment — this is the expected result
  // of confirming just one side of a two-sided email change, not a
  // failure.
  if (!error && flow === "email_change") {
    redirect(halfConfirmedRedirectUrl(origin, next));
  }

  const message = error
    ? errorMessage(flow, error)
    : (FLOW_ERROR_MESSAGES[flow] ?? "Something went wrong. Please try again.");
  redirect(failureRedirectUrl(origin, flow, next, message));
}
