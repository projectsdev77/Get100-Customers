"use client";

import { useFormStatus } from "react-dom";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/actions/Button";
import { confirmEmailToken } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? "Confirming…" : "Confirm"}
    </Button>
  );
}

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
      <SubmitButton />
    </form>
  );
}
