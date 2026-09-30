"use client";

import { useState } from "react";
import type { Quest } from "@/types/database";
import { Button, buttonClasses } from "@/components/ui/actions/Button";
import { Select } from "@/components/ui/forms/Select";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Input } from "@/components/ui/forms/Input";
import { submitQuestResult } from "./actions";

// Quests redesign §2 — "Tell us how it went". Its own bespoke shell (not
// the shared QuestCard) since the header, border and XP badge here are all
// specific to this one moment and don't belong on the dashboard's cards,
// which reuse QuestCard as-is.
export function ReportCard({ quest }: { quest: Quest }) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <section id={`quest-${quest.id}`} className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-secondary">
        Tell us how it went
      </h2>
      <form
        action={submitQuestResult}
        className="flex flex-col gap-[18px] rounded-panel border border-quest-report-border bg-card p-7"
      >
        <input type="hidden" name="questId" value={quest.id} />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[13px] text-secondary">You finished</span>
            <span className="text-[22px] font-medium leading-[1.25] tracking-[-0.01em] text-balance text-primary">
              {quest.title}
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--lime-300)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-900)]">
            +{quest.xp_value} XP on submit
          </span>
        </div>

        {quest.result_questions.map((q) =>
          q.type === "boolean" ? (
            <Select
              key={q.id}
              name={`answer_${q.id}`}
              label={q.prompt}
              defaultValue="false"
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
            />
          ) : q.type === "number" ? (
            <Input key={q.id} type="number" name={`answer_${q.id}`} label={q.prompt} min={0} defaultValue={0} />
          ) : (
            <Input key={q.id} type="text" name={`answer_${q.id}`} label={q.prompt} />
          ),
        )}
        <Textarea name="notes" label="Anything else worth noting?" rows={3} />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="md">
            Submit and claim XP
          </Button>
          {quest.reasoning && (
            <button type="button" onClick={() => setShowWhy((v) => !v)} className={buttonClasses("coach", "md")}>
              Why this?
            </button>
          )}
        </div>
        {quest.reasoning && showWhy && (
          <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm leading-[1.5] text-primary">
            {quest.reasoning}
          </p>
        )}
      </form>
    </section>
  );
}
