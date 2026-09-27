import Link from "next/link";
import { requestPasswordReset } from "../actions";
import { Card } from "@/components/ui/surfaces/Card";
import { Banner } from "@/components/ui/surfaces/Banner";
import { Input } from "@/components/ui/forms/Input";
import { Button } from "@/components/ui/actions/Button";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <Card className="flex w-full max-w-[420px] flex-col gap-5 p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
            Reset your password
          </h1>
          <p className="text-sm text-secondary">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {params.message === "check-email" && (
          <Banner tone="success">
            If an account exists for that email, we&apos;ve sent a reset link. Check your inbox.
          </Banner>
        )}
        {params.error && <Banner tone="error">{params.error}</Banner>}

        <form action={requestPasswordReset} className="flex flex-col gap-4">
          <Input label="Email" type="email" name="email" required />
          <Button type="submit" fullWidth>
            Send reset link
          </Button>
        </form>

        <p className="text-sm text-secondary">
          <Link href="/login" className="font-medium text-primary underline">
            Back to log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
