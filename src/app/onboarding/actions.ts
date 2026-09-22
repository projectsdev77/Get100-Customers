"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractFounderProfile } from "@/lib/ai/extract-founder-profile";
import { extractUploadedFileText, fetchUrlText } from "@/lib/onboarding/fetch-source-text";
import type { FounderStage } from "@/types/database";

const VALID_STAGES: FounderStage[] = ["idea", "prototype", "launched"];

export interface ExtractedFields {
  company_name: string | null;
  industry: string | null;
  product_description: string | null;
  icp: string | null;
  stage_guess: FounderStage | null;
}

type AnalyzeResult = { error?: string; extracted?: ExtractedFields };

// Optional onboarding doc/URL step (SPEC §5). Pre-fills the structured
// fields below rather than replacing them — the founder always reviews
// and can edit before saving.
export async function analyzeSource(formData: FormData): Promise<AnalyzeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const url = String(formData.get("url") || "").trim();
  const file = formData.get("file") as File | null;

  let sourceText = "";
  let docType: "url" | "upload" | null = null;
  let docSource = "";

  try {
    if (url) {
      sourceText = await fetchUrlText(url);
      docType = "url";
      docSource = url;
    } else if (file && file.size > 0) {
      sourceText = await extractUploadedFileText(file);
      docType = "upload";
      docSource = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("founder-documents")
        .upload(docSource, file);
      if (uploadError) throw uploadError;
    } else {
      return { error: "Provide a URL or a file." };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't read that source." };
  }

  if (!sourceText.trim()) {
    return { error: "Couldn't extract any text from that source." };
  }

  let extracted;
  try {
    extracted = await extractFounderProfile(sourceText);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `AI extraction failed: ${err.message}`
          : "AI extraction failed.",
    };
  }

  const { data: founderRow } = await supabase
    .from("founders")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (founderRow && docType) {
    await supabase.from("founder_documents").insert({
      founder_id: founderRow.id,
      type: docType,
      source: docSource,
      extracted_summary: extracted.summary,
    });
  }

  const stageGuess = VALID_STAGES.includes(extracted.stage_guess as FounderStage)
    ? (extracted.stage_guess as FounderStage)
    : null;

  return {
    extracted: {
      company_name: extracted.company_name,
      industry: extracted.industry,
      product_description: extracted.product_description,
      icp: extracted.icp,
      stage_guess: stageGuess,
    },
  };
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const stage = String(formData.get("stage") || "");
  const channelsTried = formData.getAll("channels_tried").map(String);
  const customerCount = Math.max(
    0,
    parseInt(String(formData.get("current_customer_count") || "0"), 10) || 0,
  );

  await supabase
    .from("founders")
    .update({
      name: String(formData.get("name") || "") || null,
      company_name: String(formData.get("company_name") || "") || null,
      industry: String(formData.get("industry") || "") || null,
      product_description: String(formData.get("product_description") || "") || null,
      icp: String(formData.get("icp") || "") || null,
      stage: VALID_STAGES.includes(stage as FounderStage) ? stage : null,
      channels_tried: channelsTried,
      current_customer_count: customerCount,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", user.id);

  redirect("/dashboard");
}
