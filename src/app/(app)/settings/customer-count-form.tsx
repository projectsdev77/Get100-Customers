"use client";

import { useActionState } from "react";
import { correctCustomerCount } from "../dashboard/actions";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Button } from "@/components/ui/actions/Button";
import { Banner } from "@/components/ui/surfaces/Banner";

type FormState = { error?: string; success?: boolean };

// SPEC §8/§14: "founder can manually adjust their reported customer
// count in settings" — correctCustomerCount already existed (dashboard
// quick-log's sibling action) but only had a UI on the dashboard. This
// is that same action, just with the settings-appropriate reason field
// and warning, per SPEC.
export function CustomerCountForm({ currentCount }: { currentCount: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => (await correctCustomerCount(formData)) as FormState,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-panel bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-primary">Customer count</h2>
        <p className="text-[13px] text-secondary">
          Correct your total if a quest self-report was wrong, or to log churn. This will affect
          your progress bar.
        </p>
      </div>

      <Input
        label="Current customer count"
        type="number"
        name="count"
        min={0}
        defaultValue={currentCount}
      />
      <Textarea
        label="Reason (optional)"
        name="reason"
        rows={2}
        placeholder="e.g. double-counted a quest report, or lost a customer"
      />

      {state.error && <Banner tone="error">{state.error}</Banner>}
      {state.success && <Banner tone="success">Saved.</Banner>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save count"}
      </Button>
    </form>
  );
}
