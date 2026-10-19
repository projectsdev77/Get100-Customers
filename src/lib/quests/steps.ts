import type { Quest } from "@/types/database";

export interface QuestStep {
  label: string;
  done: boolean;
}

// A handful of abbreviations that end in a period but aren't the end of a
// sentence — without this, "e.g. Sales Navigator" would get chopped into
// its own fake step right after "e.g.".
const ABBREVIATIONS = /\b(?:e\.g|i\.e|etc|vs|approx|dept|dr|mr|mrs|ms|jr|sr|no)\.$/i;

// Legacy/fallback path only — every AI-generated quest now returns its own
// "steps" array directly (select-quest.ts/generate-quest.ts/
// personalize-quest.ts), which lifecycle.ts writes straight into sub_tasks.
// This only ever runs for a quest that predates that (no sub_tasks yet) or
// the rare raw-template fallback (no AI steps at all).
export function parseQuestSteps(instructions: string | null): string[] {
  if (!instructions?.trim()) return [];

  const numbered = instructions
    .split(/\d+\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (numbered.length > 1) return numbered;

  // No numbered list to split on — fall back to sentence boundaries so an
  // older quest still gets more than one checkbox instead of its whole
  // paragraph as a single step. Imperfect (can't catch every abbreviation),
  // but a clear improvement over one giant blob.
  const rawSentences = instructions.split(/(?<=[.!?])\s+(?=[A-Z])/);
  const sentences: string[] = [];
  let pending = "";
  for (const part of rawSentences) {
    pending = pending ? `${pending} ${part}` : part;
    if (!ABBREVIATIONS.test(pending)) {
      sentences.push(pending.trim());
      pending = "";
    }
  }
  if (pending) sentences.push(pending.trim());

  return sentences.length > 0 ? sentences : [instructions.trim()];
}

export const MAX_QUEST_TITLE = 140;
export const MAX_STEP_LABEL = 280;
export const MAX_STEPS = 15;

// Validates a founder's edit of an active quest (title + checklist). The
// input comes from the client, so the shape is checked rather than trusted.
// Blank steps are dropped instead of rejected, so clearing a step's text
// is a quick way to remove it.
export function sanitizeQuestEdit(
  input: unknown,
): { title: string; steps: QuestStep[] } | { error: string } {
  if (typeof input !== "object" || input === null) return { error: "Nothing to save." };
  const { title, steps } = input as { title?: unknown; steps?: unknown };
  if (typeof title !== "string" || !Array.isArray(steps)) return { error: "Nothing to save." };

  const cleanTitle = title.trim();
  if (!cleanTitle) return { error: "Give the quest a title." };
  if (cleanTitle.length > MAX_QUEST_TITLE) return { error: `Keep the title under ${MAX_QUEST_TITLE} characters.` };

  const cleanSteps: QuestStep[] = [];
  for (const step of steps) {
    if (typeof step !== "object" || step === null) return { error: "Nothing to save." };
    const { label, done } = step as { label?: unknown; done?: unknown };
    if (typeof label !== "string") return { error: "Nothing to save." };
    const cleanLabel = label.trim();
    if (!cleanLabel) continue;
    if (cleanLabel.length > MAX_STEP_LABEL) return { error: `Keep each step under ${MAX_STEP_LABEL} characters.` };
    cleanSteps.push({ label: cleanLabel, done: done === true });
  }
  if (cleanSteps.length === 0) return { error: "Keep at least one step." };
  if (cleanSteps.length > MAX_STEPS) return { error: `A quest can have up to ${MAX_STEPS} steps.` };

  return { title: cleanTitle, steps: cleanSteps };
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
