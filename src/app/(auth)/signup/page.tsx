import Link from "next/link";
import { signup } from "../actions";
import { GoogleButton } from "../google-button";
import { PasswordField } from "@/components/ui/forms/PasswordField";
import { Card } from "@/components/ui/surfaces/Card";
import { Banner } from "@/components/ui/surfaces/Banner";
import { Input } from "@/components/ui/forms/Input";
import { Button } from "@/components/ui/actions/Button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <Card className="flex w-full max-w-[420px] flex-col gap-5 p-8">
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
          Sign up
        </h1>

        {params.error && <Banner tone="error">{params.error}</Banner>}

        <GoogleButton />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-subtle" />
          <span className="text-xs text-secondary">or</span>
          <div className="h-px flex-1 bg-subtle" />
        </div>

        <form action={signup} className="flex flex-col gap-4">
          <Input label="Email" type="email" name="email" required />
          <PasswordField />
          <Button type="submit" fullWidth>
            Sign up
          </Button>
        </form>

        <p className="text-sm text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
