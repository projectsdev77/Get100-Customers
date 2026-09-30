// Thin fetch wrapper over Resend's REST API (SPEC §11, PHASES.md Phase 8
// — free tier, 3,000 emails/mo). Uses fetch directly rather than adding the
// `resend` SDK package, since it's a single JSON POST.
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("sendEmail: RESEND_API_KEY or RESEND_FROM_EMAIL is not set — email not sent.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    // Previously discarded the response body on failure, so a rejected
    // send (unverified sender domain, invalid key, rate limit) looked
    // identical in the logs to a deliberately-skipped one (email pref
    // off) — nothing here to tell the two apart.
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`sendEmail: Resend API returned ${response.status} for ${to}: ${body}`);
    }
    return response.ok;
  } catch (err) {
    console.error(`sendEmail: request to Resend failed for ${to}:`, err);
    return false;
  }
}
