import { Type } from "@google/genai";
import { GEMINI_MODELS } from "./gemini";
import { generateStructuredContent } from "./generate-structured";

export interface ExtractedFounderProfile {
  company_name: string | null;
  industry: string | null;
  product_description: string | null;
  icp: string | null;
  stage_guess: "idea" | "prototype" | "launched" | null;
  summary: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    company_name: { type: Type.STRING, nullable: true },
    industry: { type: Type.STRING, nullable: true },
    product_description: { type: Type.STRING, nullable: true },
    icp: { type: Type.STRING, nullable: true },
    stage_guess: {
      type: Type.STRING,
      enum: ["idea", "prototype", "launched"],
      nullable: true,
    },
    summary: { type: Type.STRING },
  },
  required: ["summary"],
};

const PROMPT = `You are extracting a startup founder's profile from a document or website.
Read the source text and extract: company name, industry, a one-line product
description, the target customer (ICP), and a best guess at their stage
(idea/prototype/launched). Only use facts present in the text — use null for
anything not clearly stated. Also write a 2-3 sentence summary of the
business for internal notes.

Source text:
"""
{{TEXT}}
"""`;

// Onboarding doc/URL extraction (SPEC.md §5, PHASES.md Phase 2). Uses the
// "capable" tier (SPEC §15) since quality matters more than latency here —
// this runs once per founder, not on every quest.
export async function extractFounderProfile(
  sourceText: string,
): Promise<ExtractedFounderProfile> {
  const response = await generateStructuredContent({
    model: GEMINI_MODELS.capable,
    contents: PROMPT.replace("{{TEXT}}", sourceText.slice(0, 20000)),
    schema: RESPONSE_SCHEMA,
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("Gemini returned no extraction result");
  }

  const parsed = JSON.parse(raw) as Partial<ExtractedFounderProfile>;

  // Gemini's responseSchema guarantees every property is present (nullable
  // fields come back as explicit null). The Groq fallback only gets the
  // schema as a text instruction, not enforced structured output, so it can
  // just omit a key it has no answer for — which parses as undefined, not
  // null. Callers (analyzeSource, the onboarding wizard) rely on every
  // field being exactly string | null, so normalize here rather than let
  // "undefined" silently pass every `!== null` check as if it were data.
  return {
    company_name: parsed.company_name ?? null,
    industry: parsed.industry ?? null,
    product_description: parsed.product_description ?? null,
    icp: parsed.icp ?? null,
    stage_guess: parsed.stage_guess ?? null,
    summary: parsed.summary ?? "",
  };
}
