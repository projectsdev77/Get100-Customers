import { GEMINI_MODELS, getGeminiClient } from "./gemini";

// Free-text result summarization (SPEC §8, §15) — fast tier, one short
// sentence, feeds quest_results.ai_summary and growth-profile evidence.
// Returns null on empty input or any failure (never blocks quest
// completion — the structured answers are already saved by the caller).
export async function summarizeResultNotes(
  questTitle: string,
  notes: string,
): Promise<string | null> {
  if (!notes.trim()) return null;

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODELS.fast,
      contents: `Quest: "${questTitle}"
Founder's notes: """${notes}"""

In one short sentence, summarize what this reveals about what's working or
not working for their customer acquisition. Be specific and concrete —
no generic advice.`,
    });

    return response.text?.trim() || null;
  } catch {
    return null;
  }
}
