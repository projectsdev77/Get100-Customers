import Link from "next/link";
import { login } from "../actions";
import { GoogleButton } from "../google-button";
import { Card } from "@/components/ui/surfaces/Card";
import { Banner } from "@/components/ui/surfaces/Banner";
import { Input } from "@/components/ui/forms/Input";
import { PasswordInput } from "@/components/ui/forms/PasswordInput";
import { Button } from "@/components/ui/actions/Button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <Card className="flex w-full max-w-[420px] flex-col gap-5 p-8">
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
          Log in
        </h1>

        {params.message === "check-email" && (
          <Banner tone="success">Check your email to confirm your account, then log in.</Banner>
        )}
        {params.error && <Banner tone="error">{params.error}</Banner>}

        <GoogleButton next={params.next ?? "/dashboard"} flow="login" />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-subtle" />
          <span className="text-xs text-secondary">or</span>
          <div className="h-px flex-1 bg-subtle" />
        </div>

        <form action={login} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
          <Input label="Email" type="email" name="email" required />
          <PasswordInput label="Password" name="password" required autoComplete="current-password" />
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 text-sm text-primary">
              <input
                type="checkbox"
                name="remember"
                defaultChecked
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" fullWidth>
            Log in
          </Button>
        </form>

        <p className="text-sm text-secondary">
          No account?{" "}
          <Link href="/signup" className="font-medium text-primary underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
