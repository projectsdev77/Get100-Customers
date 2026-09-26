import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// The Admin API has no "get user by email" lookup — only paginated
// listUsers — so this walks pages until it finds a match or runs out.
// Only called on a failed login, to explain *why* it failed (e.g. a
// Google-only account with no password), never on the hot path.
export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  const target = email.toLowerCase();
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) return null;

    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match;

    if (!data.nextPage) return null;
    page = data.nextPage;
  }
}

export function hasIdentityProvider(user: User, provider: string): boolean {
  return (user.identities ?? []).some((identity) => identity.provider === provider);
}
