"use client";

import { useActionState } from "react";
import { resetPassword } from "../actions";
import { PasswordField } from "@/components/ui/forms/PasswordField";
import { PasswordInput } from "@/components/ui/forms/PasswordInput";
import { Button } from "@/components/ui/actions/Button";
import { Banner } from "@/components/ui/surfaces/Banner";

type FormState = { error?: string };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => (await resetPassword(formData)) as FormState,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordField label="New password" name="password" />
      <PasswordInput
        label="Confirm password"
        name="confirm_password"
        required
        autoComplete="new-password"
      />

      {state.error && <Banner tone="error">{state.error}</Banner>}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
