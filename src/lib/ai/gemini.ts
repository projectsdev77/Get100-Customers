import { GoogleGenAI } from "@google/genai";

// Gemini API client (SPEC.md §15/§18 — tiered model strategy).
// Requires GEMINI_API_KEY (see .env.example). Free tier during dev
// (PHASES.md Phases 2/5/7); swapped for a paid-tier key at launch
// (PHASES.md Phase 12).

export const GEMINI_MODELS = {
  // Cheaper/faster tier — routine quest selection/adaptation from the
  // template library (SPEC §7.1, §15).
  fast: "gemini-2.5-flash",
  // More capable tier — onboarding extraction, growth-profile synthesis,
  // chat (SPEC §15).
  capable: "gemini-2.5-pro",
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
