import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createTestFounder, deleteTestFounder, adminClient } from "./helpers";

// Checklist item "Data isolation" — confirms founder A's own RLS-scoped
// session can never read founder B's rows, at the database level. No
// browser needed: RLS is enforced by Postgres itself, independent of any
// page built on top of it, so this is the one check where an API-level test
// is actually stronger than a UI one — if this regresses, every page stays
// looking correct while silently leaking data, with no visible symptom to
// catch in a click-through pass.
test.describe("data isolation (RLS)", () => {
  test("founder A cannot read founder B's founders row via their own session", async () => {
    const a = await createTestFounder("rls-a");
    const b = await createTestFounder("rls-b");

    try {
      const anon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { error: signInError } = await anon.auth.signInWithPassword({
        email: a.email,
        password: a.password,
      });
      expect(signInError).toBeNull();

      // RLS ("founders_select_own") filters rows rather than rejecting the
      // query, so this comes back as zero rows and no error — not a 403.
      const { data: othersRow, error: othersError } = await anon
        .from("founders")
        .select("*")
        .eq("id", b.founderId);
      expect(othersError).toBeNull();
      expect(othersRow).toEqual([]);

      const { data: ownRow, error: ownError } = await anon
        .from("founders")
        .select("*")
        .eq("id", a.founderId);
      expect(ownError).toBeNull();
      expect(ownRow).toHaveLength(1);
    } finally {
      await deleteTestFounder(a.authUserId);
      await deleteTestFounder(b.authUserId);
    }
  });

  test("founder A cannot read founder B's quests via their own session", async () => {
    const a = await createTestFounder("rls-quests-a");
    const b = await createTestFounder("rls-quests-b");

    try {
      const { error: seedError } = await adminClient.from("quests").insert({
        founder_id: b.founderId,
        title: "Founder B's private quest",
        status: "active",
      });
      expect(seedError).toBeNull();

      const anon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      await anon.auth.signInWithPassword({ email: a.email, password: a.password });

      const { data, error } = await anon.from("quests").select("*").eq("founder_id", b.founderId);
      expect(error).toBeNull();
      expect(data).toEqual([]);
    } finally {
      await deleteTestFounder(a.authUserId);
      await deleteTestFounder(b.authUserId);
    }
  });
});
