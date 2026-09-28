import type { RecentQuestInfo } from "@/lib/ai/select-quest";
import { CHANNEL_LABELS } from "@/lib/founders/field-options";

// Deterministic, non-AI pattern-match over quest history (same "keep the
// numbers non-AI" philosophy as recomputeGrowthProfile and isFounderStuck)
// for naming avoidance the founder probably hasn't named to themselves yet.
// A real coach notices when you keep dodging the same thing; this is that,
// without inventing a diagnostic engine. Recomputed on every read, never
// persisted — it just stops firing once the pattern breaks.
const PATTERN_THRESHOLD = 3;
const AVOIDANT_STATUSES = ["skipped", "expired"];

// skip_reason values match the Select options in quests/page.tsx.
const SKIP_REASON_LABELS: Record<string, string> = {
  too_hard: "Too hard",
  not_relevant: "Not relevant",
  already_tried: "Already tried",
  no_time: "No time",
};

export interface SkipPattern {
  type: "category" | "reason";
  message: string;
}

// recentQuests must be newest-first (as getRecentQuestHistory returns it) —
// occurrence order below depends on that to find each group's most recent N.
export function detectSkipPattern(recentQuests: RecentQuestInfo[]): SkipPattern | null {
  const seenCategories = new Set<string>();
  for (const quest of recentQuests) {
    if (!quest.category || seenCategories.has(quest.category)) continue;
    seenCategories.add(quest.category);

    const occurrences = recentQuests
      .filter((q) => q.category === quest.category)
      .slice(0, PATTERN_THRESHOLD);
    if (
      occurrences.length === PATTERN_THRESHOLD &&
      occurrences.every((q) => AVOIDANT_STATUSES.includes(q.status))
    ) {
      const label = CHANNEL_LABELS[quest.category] ?? quest.category;
      return {
        type: "category",
        message: `You've skipped or let expire your last ${PATTERN_THRESHOLD} ${label} quests — is that really not working, or does it just not feel doable right now?`,
      };
    }
  }

  // Only explicit skips carry a skip_reason (expired quests never get one),
  // so this rule is naturally skip-only.
  const seenReasons = new Set<string>();
  for (const quest of recentQuests) {
    if (!quest.skipReason || seenReasons.has(quest.skipReason)) continue;
    seenReasons.add(quest.skipReason);

    const occurrences = recentQuests.filter((q) => q.skipReason === quest.skipReason);
    if (occurrences.length >= PATTERN_THRESHOLD) {
      const label = SKIP_REASON_LABELS[quest.skipReason] ?? quest.skipReason;
      return {
        type: "reason",
        message: `You've cited "${label}" as your reason ${occurrences.length} times recently — is that the real blocker, or is something else going on?`,
      };
    }
  }

  return null;
}
