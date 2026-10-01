"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { SubmitButton } from "@/components/ui/actions/SubmitButton";
import { confirmEmailToken } from "./actions";

export function ConfirmForm({
  tokenHash,
  type,
  next,
}: {
  tokenHash: string;
  type: EmailOtpType;
  next: string;
}) {
  return (
    <form action={confirmEmailToken.bind(null, tokenHash, type, next)}>
      <SubmitButton fullWidth pendingLabel="Confirming…">
        Confirm
      </SubmitButton>
    </form>
  );
}
