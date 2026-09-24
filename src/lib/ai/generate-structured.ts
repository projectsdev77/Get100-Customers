import { GEMINI_MODELS, getGeminiClient } from "./gemini";
import { GROQ_MODEL, getGroqClient } from "./groq";

// Shared by every AI call site (personalize-quest, generate-quest, chat,
// extract-founder-profile, summarize-result-notes): tries Gemini first,
// retries once on a transient 503, and — only if GROQ_API_KEY is set —
// falls back to Groq on a quota (429) or still-unavailable (503) error.
// Gemini's free tier caps at 20 requests/day per model, which a single
// active testing session can exhaust; Groq's free tier is far larger
// (1,000/day as of this writing) and is OpenAI-API-compatible. Groq is
// optional — without GROQ_API_KEY the app behaves exactly as before
// (Gemini failure -> null -> caller's existing template/error fallback).

interface ContentTurn {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

// Loose shape matching the Type.OBJECT-based schemas already defined per
// call site (@google/genai's Type enum) — used only to build a plain-text
// description for Groq's prompt, not for validation (each call site's own
// guardrail checks after parsing handle that, the same for either
// provider).
interface JsonSchemaLike {
  type: string;
  properties?: Record<string, JsonSchemaLike>;
  items?: JsonSchemaLike;
  enum?: string[];
  required?: string[];
}

export interface StructuredContentParams {
  model: (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];
  contents: string | ContentTurn[];
  systemInstruction?: string;
  schema?: JsonSchemaLike;
}

export interface StructuredContentResult {
  text: string | undefined;
}

function describeSchema(schema: JsonSchemaLike, indent = ""): string {
  switch (schema.type) {
    case "OBJECT": {
      const required = new Set(schema.required ?? Object.keys(schema.properties ?? {}));
      const lines = Object.entries(schema.properties ?? {}).map(([key, value]) => {
        const optional = required.has(key) ? "" : "?";
        return `${indent}  "${key}${optional}": ${describeSchema(value, indent + "  ")}`;
      });
      return `{\n${lines.join(",\n")}\n${indent}}`;
    }
    case "ARRAY":
      return schema.items ? `[${describeSchema(schema.items, indent)}]` : "[]";
    case "STRING":
      return schema.enum ? schema.enum.map((v) => `"${v}"`).join(" | ") : "string";
    case "INTEGER":
    case "NUMBER":
      return "number";
    case "BOOLEAN":
      return "boolean";
    default:
      return "any";
  }
}

function isStatus(err: unknown, status: number): boolean {
  return typeof err === "object" && err !== null && "status" in err && err.status === status;
}

async function callGemini(params: StructuredContentParams): Promise<StructuredContentResult> {
  const client = getGeminiClient();
  return client.models.generateContent({
    model: params.model,
    contents: params.contents,
    config: {
      ...(params.systemInstruction ? { systemInstruction: params.systemInstruction } : {}),
      ...(params.schema
        ? { responseMimeType: "application/json", responseSchema: params.schema }
        : {}),
    },
  });
}

async function callGroq(params: StructuredContentParams): Promise<StructuredContentResult> {
  const client = getGroqClient();

  const systemParts: string[] = [];
  if (params.systemInstruction) systemParts.push(params.systemInstruction);
  if (params.schema) {
    systemParts.push(
      `Respond with ONLY valid JSON (no markdown fences, no commentary) matching this shape:\n${describeSchema(params.schema)}`,
    );
  }

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (systemParts.length > 0) {
    messages.push({ role: "system", content: systemParts.join("\n\n") });
  }
  if (typeof params.contents === "string") {
    messages.push({ role: "user", content: params.contents });
  } else {
    for (const turn of params.contents) {
      messages.push({
        role: turn.role === "model" ? "assistant" : "user",
        content: turn.parts.map((p) => p.text).join("\n"),
      });
    }
  }

  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    ...(params.schema ? { response_format: { type: "json_object" as const } } : {}),
  });

  return { text: response.choices[0]?.message?.content ?? undefined };
}

export async function generateStructuredContent(
  params: StructuredContentParams,
): Promise<StructuredContentResult> {
  try {
    return await callGemini(params);
  } catch (err) {
    if (isStatus(err, 503)) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        return await callGemini(params);
      } catch (retryErr) {
        return fallbackOrThrow(retryErr, params);
      }
    }
    return fallbackOrThrow(err, params);
  }
}

async function fallbackOrThrow(
  err: unknown,
  params: StructuredContentParams,
): Promise<StructuredContentResult> {
  const isQuotaOrAvailabilityError = isStatus(err, 429) || isStatus(err, 503);
  if (!isQuotaOrAvailabilityError || !process.env.GROQ_API_KEY) throw err;

  console.error("Gemini unavailable, falling back to Groq:", err);
  return callGroq(params);
}
