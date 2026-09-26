"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPasswordValid } from "@/lib/auth/password";
import { findAuthUserByEmail, hasIdentityProvider } from "@/lib/auth/find-user-by-email";
import { authErrorMessage } from "@/lib/auth/error-message";

export async function login(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const next = String(formData.get("next") || "/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase returns the same generic error for "wrong password" and
    // "this account has no password at all" (e.g. signed up via Google
    // only) — same anti-enumeration reasoning as the signup duplicate-
    // email case. Look the account up to tell those apart and point a
    // Google-only founder at the right button instead of a confusing
    // "invalid credentials" for a password they never set.
    const existing = await findAuthUserByEmail(email);
    if (
      existing &&
      hasIdentityProvider(existing, "google") &&
      !hasIdentityProvider(existing, "email")
    ) {
      redirect(
        `/login?error=${encodeURIComponent(
          "This email is registered with Google. Continue with Google instead.",
        )}`,
      );
    }
    redirect(`/login?error=${encodeURIComponent(authErrorMessage(error))}`);
  }

  redirect(next);
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  // Mirrors the client-side checklist in components/ui/forms/PasswordField.tsx — enforced
  // here too since a form can be submitted without JS ever running.
  if (!isPasswordValid(password)) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Confirmation emails otherwise redirect to Supabase's configured
      // Site URL (our landing page) with no session established. Routing
      // through the same callback route as Google OAuth exchanges the
      // PKCE code for a session and lands the founder on /dashboard; if
      // that exchange fails, the route's own fallback sends them to
      // /login instead.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(authErrorMessage(error))}`);
  }

  // Supabase doesn't return an error for an email that's already
  // registered and confirmed — it returns a fake success with an empty
  // identities array instead, specifically to avoid leaking which
  // emails have accounts. An unconfirmed existing signup (identities
  // non-empty) legitimately falls through to "check your email" below,
  // since re-signing up there is how they'd get a fresh confirmation
  // link.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "An account with this email already exists. Log in instead.",
      )}`,
    );
  }

  redirect("/login?message=check-email");
}

// Google OAuth (Supabase Auth) — the Google client ID/secret live in the
// Supabase dashboard, not in this app's env, so signInWithOAuth just needs
// a redirectTo pointing at our callback route, which exchanges the code
// for a session (src/app/auth/callback/route.ts). See SETUP.md for the
// one-time Google Cloud + Supabase dashboard setup this depends on.
export async function signInWithGoogle(formData: FormData) {
  const next = String(formData.get("next") || "/dashboard");
  // "login" vs "signup" only changes what /auth/callback does with a
  // brand-new Google account — see the callback route for why.
  const flow = String(formData.get("flow") || "signup");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(next)}&flow=${flow}`,
    },
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(error ? authErrorMessage(error) : "Could not start Google sign-in.")}`,
    );
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
