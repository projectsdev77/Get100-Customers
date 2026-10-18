"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin/is-admin";
import { parseCalLink } from "@/lib/coaching/cal-link";

const BUCKET = "coach-photos";
const MAX_PHOTO_BYTES = 1024 * 1024;
const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_NAME_LENGTH = 80;
const MAX_TITLE_LENGTH = 100;

type AdminClient = ReturnType<typeof createAdminClient>;

async function requireAdmin() {
  const supabase = await createClient();
  if (!(await isCurrentUserAdmin(supabase))) throw new Error("Not authorized");
}

function finish(message: string, tone: "success" | "error" = "success"): never {
  revalidatePath("/admin/coaches");
  revalidatePath("/coaching");
  redirect(`/admin/coaches?flash=${encodeURIComponent(message)}&tone=${tone}`);
}

type Details = { name: string; title: string | null; calLink: string | null };

function readDetails(formData: FormData): Details | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const rawLink = String(formData.get("calLink") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (name.length > MAX_NAME_LENGTH) return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  if (title.length > MAX_TITLE_LENGTH) return { error: `Keep the title under ${MAX_TITLE_LENGTH} characters.` };

  let calLink: string | null = null;
  if (rawLink) {
    const parsed = parseCalLink(rawLink);
    if (!parsed.ok) return { error: parsed.error };
    calLink = parsed.link;
  }

  return { name, title: title || null, calLink };
}

// The browser already crops/shrinks the photo (photo-input.tsx); this is the
// server-side check for anything submitted without that step.
function readPhoto(formData: FormData): { file: File | null } | { error: string } {
  const value = formData.get("photo");
  if (!(value instanceof File) || value.size === 0) return { file: null };
  if (!PHOTO_EXTENSIONS[value.type]) return { error: "Photo must be a JPG, PNG or WebP image." };
  if (value.size > MAX_PHOTO_BYTES) return { error: "Photo must be under 1 MB." };
  return { file: value };
}

async function uploadPhoto(admin: AdminClient, coachId: string, file: File): Promise<string | null> {
  const path = `${coachId}/${Date.now()}.${PHOTO_EXTENSIONS[file.type]}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) {
    console.error("uploadPhoto failed:", error);
    return null;
  }
  return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removeStoredPhoto(admin: AdminClient, url: string | null) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const path = url?.split(marker)[1];
  if (!path) return;
  const { error } = await admin.storage.from(BUCKET).remove([decodeURIComponent(path)]);
  if (error) console.error("removeStoredPhoto failed:", error);
}

export async function createCoach(formData: FormData) {
  await requireAdmin();
  const details = readDetails(formData);
  if ("error" in details) finish(details.error, "error");
  const photo = readPhoto(formData);
  if ("error" in photo) finish(photo.error, "error");

  const admin = createAdminClient();
  const { data: coach, error } = await admin
    .from("coaches")
    .insert({ name: details.name, title: details.title, cal_link: details.calLink })
    .select("id")
    .single<{ id: string }>();
  if (error || !coach) {
    console.error("createCoach insert failed:", error);
    finish("Couldn't save the coach. Check the server logs.", "error");
  }

  if (photo.file) {
    const url = await uploadPhoto(admin, coach.id, photo.file);
    if (!url) finish(`Added ${details.name}, but the photo upload failed. Try again from Edit.`, "error");
    await admin.from("coaches").update({ photo_url: url }).eq("id", coach.id);
  }

  finish(`Added ${details.name}.`);
}

export async function updateCoach(formData: FormData) {
  await requireAdmin();
  const coachId = String(formData.get("coachId") ?? "");
  const details = readDetails(formData);
  if ("error" in details) finish(details.error, "error");
  const photo = readPhoto(formData);
  if ("error" in photo) finish(photo.error, "error");
  const isActive = formData.get("isActive") === "on";
  const removePhoto = formData.get("removePhoto") === "on";

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("coaches")
    .select("photo_url")
    .eq("id", coachId)
    .maybeSingle<{ photo_url: string | null }>();
  if (!existing) finish("That coach no longer exists.", "error");

  let photoUrl = existing.photo_url;
  if (photo.file) {
    const uploaded = await uploadPhoto(admin, coachId, photo.file);
    if (!uploaded) finish("The photo upload failed, so nothing was saved. Try again.", "error");
    photoUrl = uploaded;
  } else if (removePhoto) {
    photoUrl = null;
  }

  const { error } = await admin
    .from("coaches")
    .update({
      name: details.name,
      title: details.title,
      cal_link: details.calLink,
      is_active: isActive,
      photo_url: photoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coachId);
  if (error) {
    console.error("updateCoach failed:", error);
    finish("Couldn't save the changes. Check the server logs.", "error");
  }

  if (photoUrl !== existing.photo_url) await removeStoredPhoto(admin, existing.photo_url);

  finish(`Saved ${details.name}.`);
}
