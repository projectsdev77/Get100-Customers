"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateProfile } from "./actions";
import type { Founder } from "@/types/database";

type FormState = { error?: string; success?: boolean; pivotDetected?: boolean };

export function ProfileForm({ founder }: { founder: Founder | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => (await updateProfile(formData)) as FormState,
    {},
  );

  const inputClass =
    "rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
  const labelClass = "flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className={labelClass}>
        Name
        <input name="name" defaultValue={founder?.name ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Company name
        <input
          name="company_name"
          defaultValue={founder?.company_name ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Industry
        <input name="industry" defaultValue={founder?.industry ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Product description
        <textarea
          name="product_description"
          defaultValue={founder?.product_description ?? ""}
          rows={3}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Target customer (ICP)
        <input name="icp" defaultValue={founder?.icp ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Stage
        <select name="stage" defaultValue={founder?.stage ?? ""} className={inputClass}>
          <option value="">Select stage</option>
          <option value="idea">Idea</option>
          <option value="prototype">Prototype</option>
          <option value="launched">Launched</option>
        </select>
      </label>
      <label className={labelClass}>
        Channels tried (comma-separated)
        <input
          name="channels_tried"
          defaultValue={founder?.channels_tried?.join(", ") ?? ""}
          className={inputClass}
        />
      </label>

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Saved.
        </p>
      )}
      {state.pivotDetected && (
        <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          Looks like your business changed — your progress carries over, but you can{" "}
          <Link href="/onboarding" className="underline">
            revisit onboarding
          </Link>{" "}
          to update the rest of your profile.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
