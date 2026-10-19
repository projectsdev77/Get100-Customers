"use client";

import { useState, useTransition } from "react";
import type { Quest } from "@/types/database";
import { MAX_QUEST_TITLE, MAX_STEP_LABEL, MAX_STEPS, getQuestSteps, type QuestStep } from "@/lib/quests/steps";
import { Button } from "@/components/ui/actions/Button";
import { fieldClasses } from "@/components/ui/forms/Field";
import { toggleQuestStep, updateQuestContent } from "./actions";

// One checklist for an active quest, shared by the Quests page and the Home
// dashboard so a step ticked or edited in one place shows the same way in
// the other. Both read the same saved sub_tasks.
export function QuestSteps({ quest }: { quest: Pick<Quest, "id" | "title" | "sub_tasks" | "instructions"> }) {
  const steps = getQuestSteps(quest);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <QuestEditor quest={quest} steps={steps} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="flex flex-col rounded-[20px] bg-sunken p-1.5">
      {steps.map((step, i) => (
        <form key={i} action={toggleQuestStep.bind(null, quest.id, i)}>
          <button
            type="submit"
            className="flex w-full items-start gap-3 rounded-[14px] p-2.5 text-left transition-colors hover:bg-card"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11px] font-bold text-[var(--ink-900)] ${
                step.done ? "border-[var(--lime-300)] bg-[var(--lime-300)]" : "border-strong bg-transparent"
              }`}
            >
              {step.done ? "✓" : ""}
            </span>
            <span
              className={`text-sm leading-[1.5] text-balance ${step.done ? "text-secondary line-through" : "text-primary"}`}
            >
              {step.label}
            </span>
          </button>
        </form>
      ))}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="self-start rounded-full px-2.5 py-2 text-[13px] font-medium text-accent hover:underline"
      >
        Edit quest
      </button>
    </div>
  );
}

function QuestEditor({
  quest,
  steps,
  onClose,
}: {
  quest: Pick<Quest, "id" | "title">;
  steps: QuestStep[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(quest.title);
  const [draft, setDraft] = useState<QuestStep[]>(steps);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateStep(index: number, label: string) {
    setDraft((current) => current.map((step, i) => (i === index ? { ...step, label } : step)));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateQuestContent(quest.id, { title, steps: draft });
      if (result.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3 rounded-[20px] bg-sunken p-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-primary">Quest title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_QUEST_TITLE}
          className={fieldClasses()}
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-primary">Steps</span>
        {draft.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea
              value={step.label}
              onChange={(e) => updateStep(i, e.target.value)}
              maxLength={MAX_STEP_LABEL}
              rows={2}
              aria-label={`Step ${i + 1}`}
              className={`${fieldClasses()} h-auto min-h-11 resize-y py-2.5 leading-[1.5] [field-sizing:content]`}
            />
            <button
              type="button"
              onClick={() => setDraft((current) => current.filter((_, j) => j !== i))}
              disabled={draft.length <= 1}
              aria-label={`Remove step ${i + 1}`}
              className="mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg text-secondary transition-colors hover:bg-card hover:text-primary disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setDraft((current) => [...current, { label: "", done: false }])}
          disabled={draft.length >= MAX_STEPS}
          className="self-start rounded-full px-2.5 py-1.5 text-[13px] font-medium text-accent hover:underline disabled:opacity-40"
        >
          + Add a step
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
