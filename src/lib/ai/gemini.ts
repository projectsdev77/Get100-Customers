import { GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse } from "@google/genai";

// Gemini API client (SPEC.md §15/§18 — tiered model strategy).
// Requires GEMINI_API_KEY (see .env.example). Free tier during dev
// (PHASES.md Phases 2/5/7); swapped for a paid-tier key at launch
// (PHASES.md Phase 12).

export const GEMINI_MODELS = {
  // Cheaper/faster tier — routine quest selection/adaptation from the
  // template library (SPEC §7.1, §15).
  // gemini-2.5-flash was retired for new API keys (404 "no longer
  // available to new users") — Google's own error names this replacement.
  fast: "gemini-3.6-flash",
  // Both tiers point at the same model for now: gemini-3.1-pro-preview
  // (Google's named replacement for the also-retired gemini-2.5-pro) has
  // a hard `limit: 0` free-tier quota (RESOURCE_EXHAUSTED, not a
  // transient rate limit — confirmed via golden-set-check.ts), so it's
  // simply not usable without billing enabled. Swap `capable` to a real
  // pro-tier model once Phase 12's paid Gemini tier is turned on — see
  // PHASES.md §0.
  capable: "gemini-3.6-flash",
} as const;

let client: GoogleGenAI | null = null;

export function getGeminiClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set — see .env.example");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function isTransientError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "status" in err && err.status === 503;
}

// The free-tier flash model occasionally returns a 503 "high demand,
// temporary" error under load (observed via golden-set-check.ts) —
// distinct from the guardrail failures (malformed output, missing
// fields) that personalize-quest.ts/generate-quest.ts are right to treat
// as a permanent fallback-to-template case. One retry after a short delay
// clears the transient case without masking a real, persistent failure.
export async function generateContentWithRetry(
  params: GenerateContentParameters,
): Promise<GenerateContentResponse> {
  const client = getGeminiClient();
  try {
    return await client.models.generateContent(params);
  } catch (err) {
    if (!isTransientError(err)) throw err;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return client.models.generateContent(params);
  }
}
