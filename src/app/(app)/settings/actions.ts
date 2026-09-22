"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FounderStage } from "@/types/database";

const VALID_STAGES: FounderStage[] = ["idea", "prototype", "launched"];

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in." };
  }

  const stage = String(formData.get("stage") || "");
  const channelsRaw = String(formData.get("channels_tried") || "");

  const { error } = await supabase
    .from("founders")
    .update({
      name: String(formData.get("name") || "") || null,
      company_name: String(formData.get("company_name") || "") || null,
      industry: String(formData.get("industry") || "") || null,
      product_description: String(formData.get("product_description") || "") || null,
      icp: String(formData.get("icp") || "") || null,
      stage: VALID_STAGES.includes(stage as FounderStage) ? stage : null,
      channels_tried: channelsRaw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
