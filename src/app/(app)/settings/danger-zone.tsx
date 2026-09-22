"use client";

import { useActionState } from "react";
import { deleteAccount } from "./actions";

type FormState = { error?: string };

export function DangerZone() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => (await deleteAccount(formData)) as FormState,
    {},
  );

  return (
    <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Data & account</h2>

      <a
        href="/api/account/export"
        className="self-start rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
      >
        Download my data
      </a>

      <div className="rounded border border-red-300 p-4 dark:border-red-900">
        <p className="mb-2 text-sm text-red-700 dark:text-red-400">
          Deleting your account is permanent and cannot be undone — it removes your profile,
          quests, results, and everything else.
        </p>
        <form action={formAction} className="flex items-center gap-2">
          <input
            type="text"
            name="confirmation"
            placeholder='Type "DELETE" to confirm'
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Delete my account"}
          </button>
        </form>
        {state.error && <p className="mt-2 text-sm text-red-700 dark:text-red-400">{state.error}</p>}
      </div>
    </div>
  );
}
