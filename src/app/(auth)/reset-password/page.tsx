import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/surfaces/Card";
import { ResetPasswordForm } from "./reset-password-form";

// Only reachable with the session /auth/callback establishes after a
// recovery link is clicked (see requestPasswordReset). No session here
// means the link is missing, already used, or expired.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent("This reset link has expired. Request a new one.")}`,
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <Card className="flex w-full max-w-[420px] flex-col gap-5 p-8">
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
          Set a new password
        </h1>
        <ResetPasswordForm />
      </Card>
    </div>
  );
}
