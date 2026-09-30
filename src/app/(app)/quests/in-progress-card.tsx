"use client";

import { useState } from "react";
import type { Quest } from "@/types/database";
import { getQuestSteps } from "@/lib/quests/steps";
import { daysRemaining } from "@/lib/utils/days-remaining";
import { Button, buttonClasses } from "@/components/ui/actions/Button";
import { markQuestDone, toggleQuestStep } from "./actions";
import { SkipForm } from "./skip-form";

// Quests redesign §3 — the description becomes a checklist (parsed from
// instructions, persisted per step in sub_tasks — see lib/quests/steps.ts),
// with a step-progress ring and an inline "why" note instead of navigating
// away. Bespoke to this page: the dashboard keeps rendering active quests
// through the plain shared QuestCard.
export function InProgressCard({ quest, defaultOpen }: { quest: Quest; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [whyOpen, setWhyOpen] = useState(false);

  const steps = getQuestSteps(quest);
  const doneCount = steps.filter((s) => s.done).length;
  const pct = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;
  const days = quest.expires_at ? daysRemaining(quest.expires_at) : null;

  return (
    <div id={`quest-${quest.id}`} className="flex flex-col gap-[18px] rounded-panel bg-card px-7 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2.5">
          <span className="text-xl font-medium leading-[1.3] tracking-[-0.01em] text-balance text-primary">
            {quest.title}
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-secondary">
            {days != null && (
              <>
                <span>{days} days left</span>
                <Dot />
              </>
            )}
            <span>
              {doneCount} of {steps.length} steps
            </span>
            <Dot />
            <span className="font-semibold text-primary">+{quest.xp_value} XP</span>
          </div>
        </div>
        <div
          className="relative h-11 w-11 shrink-0 rounded-full"
          style={{ background: `conic-gradient(var(--accent) ${pct}%, var(--surface-sunken) 0)` }}
        >
          <div className="absolute inset-[5px] rounded-full bg-card" />
        </div>
      </div>

      {open && steps.length > 0 && (
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
                  className={`text-sm leading-[1.5] text-balance ${
                    step.done ? "text-secondary line-through" : "text-primary"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </form>
          ))}
        </div>
      )}

      {whyOpen && quest.reasoning && (
        <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm leading-[1.5] text-primary">
          <strong className="font-semibold">Why this quest: </strong>
          {quest.reasoning}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <form action={markQuestDone.bind(null, quest.id)}>
          <Button type="submit" size="md">
            Mark done
          </Button>
        </form>
        <SkipForm questId={quest.id} size="md" />
        {quest.reasoning && (
          <button type="button" onClick={() => setWhyOpen((v) => !v)} className={buttonClasses("coach", "md")}>
            Why this?
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={buttonClasses("secondary", "md", false, "!bg-transparent !text-secondary")}
        >
          {open ? "Hide steps" : "Show steps"}
        </button>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-current" />;
}
