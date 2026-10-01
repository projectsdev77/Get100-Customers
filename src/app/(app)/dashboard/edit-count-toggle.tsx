"use client";

import { useActionState, useEffect, useState } from "react";
import { correctCustomerCount } from "./actions";
import { Input } from "@/components/ui/forms/Input";
import { Button } from "@/components/ui/actions/Button";

type FormState = { error?: string; success?: boolean };

// dashboard-fix handoff item #4: the old always-visible correction field
// was ~20px tall, unlabeled, and misaligned with its Save button. Hidden
// behind this toggle instead; reuses the existing correctCustomerCount
// action unchanged (same one Settings' CustomerCountForm calls) — only the
// show/hide chrome around it is new.
export function EditCountToggle({
  currentCount,
  icon,
}: {
  currentCount: number;
  /** Decorative only — 06-illustration-placement §4 ("Log progress card: spot-journal, 80x80, right"). Omit for no change in behavior. */
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => (await correctCustomerCount(formData)) as FormState,
    {},
  );

  useEffect(() => {
    // Deferred to a microtask rather than called synchronously in the
    // effect body, per the stricter react-hooks/set-state-in-effect rule —
    // this is a genuine post-server-round-trip reaction (closing the form
    // once the save succeeds), not something derivable during render.
    if (state.success) queueMicrotask(() => setOpen(false));
  }, [state.success]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="flex-1 text-base font-medium text-primary">Log progress</h2>
        {icon}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-accent"
          >
            Edit count
          </button>
        )}
      </div>
      {open && (
        <form action={formAction} className="flex items-end gap-2">
          <Input
            label="Correct your count"
            type="number"
            name="count"
            min={0}
            defaultValue={currentCount}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </form>
      )}
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </div>
  );
}
