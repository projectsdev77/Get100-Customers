import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Card } from "@/components/ui/surfaces/Card";
import { ConfirmForm } from "./confirm-form";

// Supabase's default {{ .ConfirmationURL }} email-template format is a
// bare GET link that verifies and signs in in one step. Many corporate
// email gateways (and some mail providers) pre-fetch every link in an
// email to scan it for safety before the recipient ever opens it — since
// that scan is itself a GET to the link, it silently consumes the
// one-time confirmation token, so the founder's own click a moment later
// fails even though the link is fresh, unused by them, and opened in the
// same browser that requested it. That's the standard explanation for a
// confirmation link that "keeps not working" despite none of the usual
// causes (expired, wrong browser, already clicked) applying.
//
// This page is the fix: the dashboard's email template links here with
// {{ .TokenHash }} instead, and the token is only verified once a person
// actually presses the button below — a page load alone (what a scanner
// does) can't trigger that click handler, so a real click still works
// even if the link was scanned first.
export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const { token_hash: tokenHash, type, next } = await searchParams;

  if (!tokenHash || !type) {
    redirect(`/login?error=${encodeURIComponent("That confirmation link is invalid.")}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <Card className="flex w-full max-w-[420px] flex-col gap-5 p-8 text-center">
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
          Confirm to continue
        </h1>
        <p className="text-secondary">Press the button below to finish confirming this.</p>
        <ConfirmForm tokenHash={tokenHash} type={type as EmailOtpType} next={next || "/dashboard"} />
      </Card>
    </div>
  );
}
