import type { createClient } from "@/lib/supabase/server";
import type { Quest, QuestResult } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface ChannelStats {
  attempts: number;
  successes: number;
  conversion_rate: number;
}

// Numeric aggregation is straightforward (non-AI) by design (SPEC §9,
// PHASES.md Phase 4) — Phase 5 only adds the AI-summarized notes as
// supplementary evidence text (SPEC §8) on top of the same shape; the
// conversion-rate ranking itself stays deterministic.
export async function recomputeGrowthProfile(
  supabase: SupabaseServerClient,
  founderId: string,
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
    .filter(([, s]) => s.attempts >= 2 && s.successes === 0)
    .map(([category, s]) => ({
      insight: `${category} hasn't converted after ${s.attempts} attempts`,
      evidence: latestSummaryByCategory[category] ?? `conversion_rate=0`,
    }));

  const totalAttempts = Object.values(channels).reduce((sum, s) => sum + s.attempts, 0);
  let bottleneckHypothesis: string;
  if (totalAttempts < 3) {
    bottleneckHypothesis = "Not enough data yet — complete a few more quests.";
  } else if (whatWorking.length === 0) {
    bottleneckHypothesis =
      "No channel has converted yet — consider adjusting messaging or target customer.";
  } else if (whatNotWorking.length > 0) {
    bottleneckHypothesis = `${whatNotWorking[0].insight} — consider dropping or changing that channel.`;
  } else {
    bottleneckHypothesis = `Keep leaning into ${whatWorking[0].insight.split(" has")[0]} — it's your best-performing channel so far.`;
  }

  await supabase
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
