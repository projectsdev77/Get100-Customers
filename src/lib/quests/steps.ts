import type { Quest } from "@/types/database";

export interface QuestStep {
  label: string;
  done: boolean;
}

// Quest instructions are AI-written as a numbered list ("1. ... 2. ...") —
// this splits that into individual steps for the in-progress checklist.
// Falls back to one single step when there's no numbering at all (a
// net-new quest whose instructions came out as a single sentence).
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
