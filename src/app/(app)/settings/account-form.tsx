"use client";

import { useActionState } from "react";
import { changePassword, changeEmail, signOutEverywhere } from "./actions";
import { Input } from "@/components/ui/forms/Input";
import { PasswordField } from "@/components/ui/forms/PasswordField";
import { PasswordInput } from "@/components/ui/forms/PasswordInput";
import { Button } from "@/components/ui/actions/Button";
import { Banner } from "@/components/ui/surfaces/Banner";

type PasswordState = { error?: string; success?: boolean };
type EmailState = { error?: string; success?: boolean };

function ConnectedAccounts({ hasGoogle }: { hasGoogle: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-primary">Connected accounts</span>
      <div className="flex items-center justify-between rounded-tile bg-sunken px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-primary">
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
            />
          </svg>
          Google
        </span>
        <span
          className={`text-xs font-medium ${hasGoogle ? "text-tile-level-ink" : "text-secondary"}`}
        >
          {hasGoogle ? "Connected" : "Not connected"}
        </span>
      </div>
    </div>
  );
}

function EmailForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<EmailState, FormData>(
    async (_prevState, formData) => (await changeEmail(formData)) as EmailState,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-primary">Email address</span>
      <div className="flex flex-wrap items-end gap-2">
        <Input
          name="email"
          type="email"
          defaultValue={email}
          required
          className="min-w-[220px] flex-1"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Sending…" : "Change email"}
        </Button>
      </div>
      <p className="text-xs text-secondary">
        We&apos;ll send a confirmation link to the new address (and possibly your current one) —
        nothing changes until you click it.
      </p>
      {state.error && <Banner tone="error">{state.error}</Banner>}
      {state.success && (
        <Banner tone="success">Check your inbox to confirm the change.</Banner>
      )}
    </form>
  );
}

function PasswordChangeForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    async (_prevState, formData) => (await changePassword(formData)) as PasswordState,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-primary">
        {hasPassword ? "Password" : "Set a password"}
      </span>
      {!hasPassword && (
        <p className="text-xs text-secondary">
          Your account currently only signs in with Google. Set a password to also be able to log
          in with your email.
        </p>
      )}
      {hasPassword && (
        <PasswordInput label="Current password" name="current_password" autoComplete="current-password" />
      )}
      <PasswordField label={hasPassword ? "New password" : "Password"} name="new_password" />

      {state.error && <Banner tone="error">{state.error}</Banner>}
      {state.success && <Banner tone="success">Password updated.</Banner>}

      <Button type="submit" variant="outline" disabled={pending} className="self-start">
        {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
      </Button>
    </form>
  );
}

export function AccountForm({
  email,
  hasPassword,
  hasGoogle,
}: {
  email: string;
  hasPassword: boolean;
  hasGoogle: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-panel bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-primary">Account</h2>
        <p className="text-[13px] text-secondary">Your login, email, and connected accounts.</p>
      </div>

      <EmailForm email={email} />
      <div className="h-px bg-subtle" />
      <PasswordChangeForm hasPassword={hasPassword} />
      <div className="h-px bg-subtle" />
      <ConnectedAccounts hasGoogle={hasGoogle} />
      <div className="h-px bg-subtle" />

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-primary">Sessions</span>
        <p className="text-xs text-secondary">
          Sign out everywhere if you think another device is still signed in.
        </p>
        <form action={signOutEverywhere}>
          <Button type="submit" variant="outline" size="sm">
            Sign out of all devices
          </Button>
        </form>
      </div>
    </div>
  );
}
