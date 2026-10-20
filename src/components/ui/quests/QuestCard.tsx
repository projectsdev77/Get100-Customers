"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { XpPill } from "@/components/ui/game/LevelBadge";
import { buttonClasses } from "@/components/ui/actions/Button";
import { CELEBRATIONS_ENABLED } from "@/lib/celebrations/flag";
import { illustrationForCategory } from "@/lib/celebrations/illustrations";
import { DecorativeImage } from "@/components/celebrations/DecorativeImage";

export type QuestCardStatus =
  | "suggested"
  | "active"
  | "in_progress"
  | "awaiting_report"
  | "completed"
  | "skipped"
  | "expired";

const STATUS_META: Record<QuestCardStatus, { label: string; bg: string; ink: string }> = {
  suggested: { label: "Next up", bg: "bg-quest-suggested", ink: "bg-quest-suggested-ink" },
  active: { label: "Active", bg: "bg-quest-active", ink: "bg-quest-active-ink" },
  in_progress: { label: "Active", bg: "bg-quest-active", ink: "bg-quest-active-ink" },
  awaiting_report: { label: "Report your results", bg: "bg-quest-input", ink: "bg-quest-input-ink" },
  completed: { label: "Done", bg: "bg-quest-done", ink: "bg-quest-done-ink" },
  skipped: { label: "Skipped", bg: "bg-quest-done", ink: "bg-quest-done-ink" },
  expired: { label: "Expired", bg: "bg-quest-done", ink: "bg-quest-done-ink" },
};

// Reference: design-system/components/quests/QuestCard.jsx. Reimplemented
// with Tailwind utilities (mapped to the same tokens) instead of inline
// styles, and as a client component so "Why this?" can toggle locally
// without round-tripping through a server action.
export function QuestCard({
  id,
  status,
  title,
  steps,
  xp,
  window,
  tool,
  reasoning,
  category,
  actions,
  children,
}: {
  id?: string;
  status: QuestCardStatus;
  title: string;
  /** Read-only numbered preview, e.g. for a suggestion not yet accepted. */
  steps?: string[];
  xp?: number;
  window?: string | null;
  tool?: { label: string; content: string } | null;
  reasoning?: string | null;
  /** Decorative only — picks a small category illustration when one matches (README §6). Omit for no change in behavior. */
  category?: string | null;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const meta = STATUS_META[status];
  const categoryImage = CELEBRATIONS_ENABLED ? illustrationForCategory(category) : null;

  return (
    <div id={id} className="flex flex-col gap-3 rounded-panel bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
          <span
            className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-on-tile ${meta.bg}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.ink}`} />
            {meta.label}
          </span>
          <span className="text-xl font-medium leading-[1.25] tracking-[-0.01em] text-balance text-primary">
            {title}
          </span>
        </div>
        {(window || xp != null || categoryImage) && (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {(window || xp != null) && (
              <span className="flex items-center gap-2">
                {window && <span className="text-xs text-secondary">{window}</span>}
                {xp != null && <XpPill xp={xp} />}
              </span>
            )}
            {categoryImage && (
              <DecorativeImage src={categoryImage} className="h-[96px] w-[104px] object-contain" />
            )}
          </div>
        )}
      </div>

      {steps && steps.length > 0 && (
        <ol className="flex flex-col gap-1 rounded-[20px] bg-sunken p-1.5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 p-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-card text-[11px] font-semibold text-secondary">
                {i + 1}
              </span>
              <span className="text-sm leading-[1.5] text-balance text-primary">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {tool && (
        <div className="flex flex-col gap-1.5 rounded-tile bg-sunken p-4">
          <span className="text-[11px] font-medium tracking-[0.08em] text-secondary">
            YOUR TOOL
          </span>
          <div className="whitespace-pre-wrap text-sm text-primary">{tool.content}</div>
        </div>
      )}

      {reasoning && showWhy && (
        <p className="rounded-tile bg-accent-soft p-3 text-sm text-primary">{reasoning}</p>
      )}

      {children}

      {(actions || reasoning) && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {reasoning && (
            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              className={buttonClasses("coach", "sm")}
            >
              Why this?
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function JournalRow({
  status,
  title,
  xp,
  note,
}: {
  status: QuestCardStatus;
  title: string;
  xp?: number | null;
  note?: string | null;
}) {
  const meta = STATUS_META[status];
  return (
    <div className="flex items-center gap-3 border-t border-subtle px-1 py-3 first:border-t-0">
      <span className="w-[76px] shrink-0 text-xs font-medium text-secondary">{meta.label}</span>
      <span className={`min-w-0 flex-1 text-sm ${status === "completed" ? "text-primary" : "text-secondary"}`}>
        {title}
        {note && <span className="text-secondary"> · {note}</span>}
      </span>
      {xp != null && status === "completed" && (
        <span className="font-mono text-xs font-medium text-secondary">+{xp} XP</span>
      )}
    </div>
  );
}
