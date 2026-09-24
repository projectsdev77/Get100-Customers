import { GoogleGenAI } from "@google/genai";

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
  // More capable tier — onboarding extraction, growth-profile synthesis,
  // chat (SPEC §15). Same retirement as above; gemini-3.1-pro-preview is
  // Google's named replacement for gemini-2.5-pro. Being a "preview"
  // model, watch for it being renamed/retired again.
  capable: "gemini-3.1-pro-preview",
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
