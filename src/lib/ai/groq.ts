import Groq from "groq-sdk";

// Fallback LLM provider, used only when Gemini returns a quota or
// availability error (see generate-structured.ts) — Gemini's free tier
// caps at 20 requests/day per model, which is tight for active testing.
// Groq's free tier is far more generous (1,000 requests/day as of this
// writing) and is OpenAI-API-compatible, so no schema/response-shape
// gymnastics beyond what generate-structured.ts already does. Optional:
// the app works fine without GROQ_API_KEY set, it just has no fallback
// when Gemini's quota runs out.
//
// llama-3.3-70b-versatile was retired by Groq (June 2026, confirmed live
// via a 404 "model_not_found"); openai/gpt-oss-120b is Groq's current
// general-purpose model (see console.groq.com/docs/models — check there
// again if this one also gets retired, Groq's free-tier lineup churns).
export const GROQ_MODEL = "openai/gpt-oss-120b";

let client: Groq | null = null;

export function getGroqClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set — see .env.example");
    }
    client = new Groq({ apiKey });
  }
  return client;
}
