// Thin fetch wrapper over Resend's REST API (SPEC §11, PHASES.md Phase 8
// — free tier, 3,000 emails/mo). Uses fetch directly rather than adding the
// `resend` SDK package, since it's a single JSON POST.
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
