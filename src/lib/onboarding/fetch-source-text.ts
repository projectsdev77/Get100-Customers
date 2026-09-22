// Best-effort text extraction for onboarding doc/URL upload (SPEC §5).
// Handles plain HTML pages and text-based file uploads (.txt/.md). Binary
// formats (PDF/DOCX pitch decks) need a dedicated parser and are noted as a
// gap here rather than guessed at — see PHASES.md Phase 2.

export async function fetchUrlText(url: string): Promise<string> {
  const parsed = new URL(url); // throws if not a valid absolute URL
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http/https URLs are supported");
  }

  const response = await fetch(parsed.toString(), {
    headers: { "User-Agent": "Get100CustomersBot/0.1" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  return stripHtml(html);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractUploadedFileText(file: File): Promise<string> {
  const isTextLike =
    file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name);

  if (!isTextLike) {
    throw new Error(
      `Unsupported file type "${file.type || file.name}" — only .txt/.md are supported for now (PDF/DOCX parsing is a fast-follow, see PHASES.md Phase 2).`,
    );
  }

  return file.text();
}
