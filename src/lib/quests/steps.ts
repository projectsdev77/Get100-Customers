import type { Quest } from "@/types/database";

export interface QuestStep {
  label: string;
  done: boolean;
}

// Legacy/fallback path only — every AI-generated quest now returns its own
// "steps" array directly (select-quest.ts/generate-quest.ts/
// personalize-quest.ts), which lifecycle.ts writes straight into sub_tasks.
// This regex-split only kicks in for a quest that predates that (no
// sub_tasks yet) or the rare raw-template fallback (no AI steps at all) —
// and even then only works when instructions happen to be numbered
// ("1. ... 2. ..."); otherwise the whole thing becomes one step.
export function parseQuestSteps(instructions: string | null): string[] {
  if (!instructions?.trim()) return [];
  const parts = instructions
    .split(/\d+\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [instructions.trim()];
}

// sub_tasks is the persisted checklist (label + done, ticked per founder);
// it's empty for a quest nobody has ticked yet, so this derives a
// display-ready list from instructions on the fly. toggleQuestStep
// (actions.ts) runs the same derivation before writing, so the first
// tick is what actually persists the full list, not just that one entry.
export function getQuestSteps(quest: Pick<Quest, "sub_tasks" | "instructions">): QuestStep[] {
  if (quest.sub_tasks.length > 0) return quest.sub_tasks;
  return parseQuestSteps(quest.instructions).map((label) => ({ label, done: false }));
}
