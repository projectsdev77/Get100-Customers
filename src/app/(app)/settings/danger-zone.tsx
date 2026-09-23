"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "./actions";
import { Input } from "@/components/ui/forms/Input";
import { Button, LinkButton } from "@/components/ui/actions/Button";
import { Banner } from "@/components/ui/surfaces/Banner";

type FormState = { error?: string };

export function DangerZone() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => (await deleteAccount(formData)) as FormState,
    {},
  );
  const [confirmation, setConfirmation] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <LinkButton href="/api/account/export" variant="outline" size="sm" className="self-start">
        Download my data
      </LinkButton>

      <div className="flex flex-col gap-3.5 rounded-panel border border-banner-error-border bg-card p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-danger">Delete account</h2>
          <p className="text-sm text-secondary">
            This permanently deletes your quests, progress and chat history. It can&apos;t be
            undone.
          </p>
        </div>

        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <Input
            label="Type DELETE to confirm"
            name="confirmation"
            placeholder="DELETE"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="min-w-[200px] flex-1 font-mono"
          />
          <Button type="submit" variant="danger" disabled={pending || confirmation !== "DELETE"}>
            {pending ? "Deleting…" : "Delete my account"}
          </Button>
        </form>

        {state.error && <Banner tone="error">{state.error}</Banner>}
      </div>
    </div>
  );
}
