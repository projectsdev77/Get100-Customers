"use client";

import { useState } from "react";
import type { Quest } from "@/types/database";
import { getQuestSteps } from "@/lib/quests/steps";
import { daysRemaining } from "@/lib/utils/days-remaining";
import { Button, buttonClasses } from "@/components/ui/actions/Button";
import { markQuestDone } from "./actions";
import { QuestSteps } from "./quest-steps";
import { SkipForm } from "./skip-form";

// Quests redesign §3 — the description becomes a checklist (parsed from
// instructions, persisted per step in sub_tasks — see lib/quests/steps.ts),
// with a step-progress ring and an inline "why" note instead of navigating
// away. The checklist itself (QuestSteps) is shared with the dashboard's
// active-quest card so ticks and edits match everywhere.
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

      {open && steps.length > 0 && <QuestSteps quest={quest} />}

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
