// Chat's system prompt hands the model quests as "id: title — status" so
// it can reference one by id (proposed_swap_quest_id) — but the model
// sometimes echoes that raw id into its natural-language reply text too
// (quests redesign §5). This is a deterministic backstop since a prompt
// instruction alone can't guarantee it never happens: strips a full UUID,
// and a bare run of 8+ hex characters as a fallback for a partial/
// malformed id, which normal coaching text won't otherwise contain.
export function stripQuestIds(text: string): string {
  return text
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "")
    // Requires at least one a-f letter so a plain number (a customer count,
    // a phone number) is never mistaken for a leaked id fragment.
    .replace(/\b(?=[0-9a-f]*[a-f])[0-9a-f]{8,}\b/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ ([.,;:!?])/g, "$1")
    .trim();
}
