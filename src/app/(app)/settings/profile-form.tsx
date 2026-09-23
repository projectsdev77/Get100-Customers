"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateProfile } from "./actions";
import type { Founder } from "@/types/database";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { ChipGroup } from "@/components/ui/forms/Chip";
import { Button } from "@/components/ui/actions/Button";
import { Banner } from "@/components/ui/surfaces/Banner";
import {
  CHANNEL_OPTIONS,
  CHANNEL_VALUES,
  CHANNEL_LABELS,
  STAGE_OPTIONS,
  STAGE_LABELS,
  STAGE_VALUES,
  HOURS_OPTIONS,
  HOURS_VALUES,
  HOURS_LABELS,
} from "@/lib/founders/field-options";

type FormState = { error?: string; success?: boolean; pivotDetected?: boolean };

export function ProfileForm({ founder }: { founder: Founder | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => (await updateProfile(formData)) as FormState,
    {},
  );

  const [stage, setStage] = useState(founder?.stage ?? "");
  const [channels, setChannels] = useState<string[]>(founder?.channels_tried ?? []);
  const [weeklyHours, setWeeklyHours] = useState(founder?.weekly_hours ?? "");

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-panel bg-card p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-primary">Business profile</h2>
        <p className="text-[13px] text-secondary">Your coach uses this to pick quests.</p>
      </div>

      <Input label="Name" name="name" defaultValue={founder?.name ?? ""} />
      <Input label="Company name" name="company_name" defaultValue={founder?.company_name ?? ""} />
      <Input label="Industry" name="industry" defaultValue={founder?.industry ?? ""} />
      <Textarea
        label="What you sell"
        name="product_description"
        defaultValue={founder?.product_description ?? ""}
        rows={2}
      />
      <Input label="Target customer (ICP)" name="icp" defaultValue={founder?.icp ?? ""} />

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-primary">Stage</span>
        <ChipGroup
          options={STAGE_OPTIONS}
          multi={false}
          value={STAGE_LABELS[stage] ?? ""}
          onChange={(v) => setStage(STAGE_VALUES[v as string])}
        />
        <input type="hidden" name="stage" value={stage} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-primary">Channels tried</span>
        <ChipGroup
          options={CHANNEL_OPTIONS}
          value={channels.map((c) => CHANNEL_LABELS[c] ?? c)}
          onChange={(v) =>
            setChannels((v as string[]).map((label) => CHANNEL_VALUES[label]))
          }
        />
        {channels.map((c) => (
          <input key={c} type="hidden" name="channels_tried" value={c} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-primary">Hours a week</span>
        <ChipGroup
          options={HOURS_OPTIONS}
          multi={false}
          value={HOURS_LABELS[weeklyHours] ?? ""}
          onChange={(v) => setWeeklyHours(HOURS_VALUES[v as string])}
        />
        <input type="hidden" name="weekly_hours" value={weeklyHours} />
      </div>

      {state.error && <Banner tone="error">{state.error}</Banner>}
      {state.success && <Banner tone="success">Saved.</Banner>}
      {state.pivotDetected && (
        <Banner tone="info">
          Looks like your business changed — your progress carries over, but you can{" "}
          <Link href="/onboarding" className="underline">
            revisit onboarding
          </Link>{" "}
          to update the rest of your profile.
        </Banner>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
