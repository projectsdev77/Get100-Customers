import type { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BuyingMotion, Quest, QuestResult } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface ChannelStats {
  attempts: number;
  successes: number;
  conversion_rate: number;
}

// A sales-led founder's cycle can span weeks, so judging a channel "not
// working" after the same 2 attempts that would be a fair bar for a
// self-serve founder prematurely writes it off before deals have had time
// to close (SPEC gap #7's residual limitation, now fixed here rather than
// left as a known gap). local_in_person gets no special patience — those
// cycles are typically as fast as self-serve, just not remote.
function notWorkingThreshold(buyingMotion: BuyingMotion | null): number {
  return buyingMotion === "sales_led" ? 4 : 2;
}
function minAttemptsForHypothesis(buyingMotion: BuyingMotion | null): number {
  return buyingMotion === "sales_led" ? 5 : 3;
}

// Numeric aggregation is straightforward (non-AI) by design (SPEC §9,
// PHASES.md Phase 4) — Phase 5 only adds the AI-summarized notes as
// supplementary evidence text (SPEC §8) on top of the same shape; the
// conversion-rate ranking itself stays deterministic.
export async function recomputeGrowthProfile(
  supabase: SupabaseServerClient,
  founderId: string,
  buyingMotion: BuyingMotion | null = null,
): Promise<void> {
  const { data: quests } = await supabase
    .from("quests")
    .select("*, quest_results(*)")
    .eq("founder_id", founderId)
    .eq("status", "completed")
    .order("completed_at", { ascending: true })
    .returns<(Quest & { quest_results: QuestResult[] })[]>();

  const completed = quests ?? [];

  const channels: Record<string, ChannelStats> = {};
  const latestSummaryByCategory: Record<string, string> = {};
  for (const quest of completed) {
    if (!quest.category) continue;
    const result = quest.quest_results[0];
    const converted = result?.structured_answers?.converted === true;
    if (result?.ai_summary) {
      latestSummaryByCategory[quest.category] = result.ai_summary;
    }

    const stats = channels[quest.category] ?? { attempts: 0, successes: 0, conversion_rate: 0 };
    stats.attempts += 1;
    if (converted) stats.successes += 1;
    stats.conversion_rate = stats.successes / stats.attempts;
    channels[quest.category] = stats;
  }

  const whatWorking = Object.entries(channels)
    .filter(([, s]) => s.successes > 0)
    .sort(([, a], [, b]) => b.conversion_rate - a.conversion_rate)
    .map(([category, s]) => ({
      insight: `${category} has converted ${s.successes} of ${s.attempts} attempts`,
      evidence: latestSummaryByCategory[category] ?? `conversion_rate=${s.conversion_rate.toFixed(2)}`,
    }));

  const whatNotWorking = Object.entries(channels)
    .filter(([, s]) => s.attempts >= notWorkingThreshold(buyingMotion) && s.successes === 0)
    .map(([category, s]) => ({
      insight:
        buyingMotion === "sales_led"
          ? `${category} hasn't converted after ${s.attempts} attempts (given a longer sales cycle, that's still a real signal)`
          : `${category} hasn't converted after ${s.attempts} attempts`,
      evidence: latestSummaryByCategory[category] ?? `conversion_rate=0`,
    }));

  const totalAttempts = Object.values(channels).reduce((sum, s) => sum + s.attempts, 0);
  let bottleneckHypothesis: string;
  if (totalAttempts < minAttemptsForHypothesis(buyingMotion)) {
    bottleneckHypothesis = "Not enough data yet. Complete a few more quests.";
  } else if (whatWorking.length === 0) {
    bottleneckHypothesis =
      "No channel has converted yet. Consider adjusting your messaging or target customer.";
  } else if (whatNotWorking.length > 0) {
    bottleneckHypothesis = `${whatNotWorking[0].insight}. Consider dropping or changing that channel.`;
  } else {
    bottleneckHypothesis = `Keep leaning into ${whatWorking[0].insight.split(" has")[0]}. It's your best-performing channel so far.`;
  }

  // growth_profiles has a SELECT-only RLS policy (it's system-derived
  // state, not a founder-authored write, same reasoning as
  // notifications_log/subscriptions) — the upsert must go through the
  // admin client, or it would be silently blocked and no rows would ever
  // actually update.
  await createAdminClient()
    .from("growth_profiles")
    .upsert(
      {
        founder_id: founderId,
        channels_tried: channels,
        what_working: whatWorking,
        what_not_working: whatNotWorking,
        bottleneck_hypothesis: bottleneckHypothesis,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "founder_id" },
    );
}
