"use client";

import { useState, type ChangeEvent } from "react";

const OUTPUT_SIZE = 400;

// Center-crops to a square and scales to 400px so every upload is small
// (well under the 1 MB server-action limit) and displays as a clean circle.
async function cropToSquare(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );
  bitmap.close();

  // Browsers that can't encode WebP fall back to PNG, which the server accepts too.
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("Couldn't encode image");
  const extension = blob.type === "image/webp" ? "webp" : "png";
  return new File([blob], `photo.${extension}`, { type: blob.type });
}

export function CoachPhotoInput({ currentUrl }: { currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    setError(null);
    if (!file) return;

    try {
      const cropped = await cropToSquare(file);
      const transfer = new DataTransfer();
      transfer.items.add(cropped);
      input.files = transfer.files;
      setPreview(URL.createObjectURL(cropped));
    } catch {
      input.value = "";
      setError("Couldn't read that image. Try a JPG or PNG.");
    }
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-primary">Photo</span>
      <span className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-12 w-12 shrink-0 rounded-full bg-sunken object-cover" />
        ) : (
          <span className="h-12 w-12 shrink-0 rounded-full bg-sunken" aria-hidden="true" />
        )}
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="text-sm text-secondary file:mr-3 file:h-9 file:cursor-pointer file:rounded-full file:border-0 file:bg-action-2 file:px-3.5 file:text-[13px] file:font-medium file:text-primary"
        />
      </span>
      <span className={`text-xs ${error ? "text-danger" : "text-secondary"}`}>
        {error ?? "Cropped to a square automatically."}
      </span>
    </label>
  );
}
