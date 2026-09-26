import type { CookieOptions } from "@supabase/ssr";

// A cookie with no maxAge/expires is a browser SESSION cookie (gone
// when the browser closes) rather than a persistent one. login()/
// signup() set this marker (itself a session cookie, value "0") when
// the founder unchecks "Remember me". Its mere presence has to keep
// being honored on every later request — proxy.ts refreshes the
// Supabase auth cookies constantly, and each refresh writes them with
// Supabase's normal (persistent) options unless we strip that here —
// otherwise an unchecked "Remember me" would silently turn persistent
// again on the next page load, before the browser ever closed.
export const REMEMBER_ME_COOKIE = "remember-me";

export function stripPersistence(options: CookieOptions): CookieOptions {
  return { ...options, maxAge: undefined, expires: undefined };
}
