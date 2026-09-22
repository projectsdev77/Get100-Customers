import { createAdminClient } from "@/lib/supabase/admin";
import type { GrowthProfile } from "@/types/database";

// Shared by churn flagging and pivot detection (SPEC §14) — both are
// "something changed the founder's trajectory, the AI should know" events.
// Admin client — growth_profiles is SELECT-only for the founder's own
// session (same reasoning as recomputeGrowthProfile).
export async function appendStrategyHistory(founderId: string, summary: string): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("growth_profiles")
    .select("strategy_history")
    .eq("founder_id", founderId)
    .maybeSingle<Pick<GrowthProfile, "strategy_history">>();

  const entry = { date: new Date().toISOString(), summary };

  await admin.from("growth_profiles").upsert(
    {
      founder_id: founderId,
      strategy_history: [...(existing?.strategy_history ?? []), entry],
      last_updated: new Date().toISOString(),
    },
    { onConflict: "founder_id" },
  );
}
