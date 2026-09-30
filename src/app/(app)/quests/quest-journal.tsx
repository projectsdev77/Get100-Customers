"use client";

import { useState } from "react";

export interface JournalEntry {
  id: string;
  title: string;
  bucket: "done" | "skipped";
  rightLabel: string;
  note: string | null;
}

type Tab = "all" | "done" | "skipped";

// Quests redesign §4 — segmented All/Done/Skipped filter, 5 rows by
// default with a "Show all N"/"Show less" toggle. Both are per-viewer UI
// state only, so this stays a small client component over data page.tsx
// already fetched, filtered to history and deduped server-side.
export function QuestJournal({ entries }: { entries: JournalEntry[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [showAll, setShowAll] = useState(false);

  const doneCount = entries.filter((e) => e.bucket === "done").length;
  const skippedCount = entries.filter((e) => e.bucket === "skipped").length;
  const filtered = tab === "all" ? entries : entries.filter((e) => e.bucket === tab);
  const visible = showAll ? filtered : filtered.slice(0, 5);

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "all", label: `All ${entries.length}` },
    { key: "done", label: `Done ${doneCount}` },
    { key: "skipped", label: `Skipped ${skippedCount}` },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-secondary">Quest journal</h2>
        <div className="flex gap-1 rounded-full bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setShowAll(false);
              }}
              className={`h-9 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                tab === t.key ? "bg-action-2 text-primary" : "bg-transparent text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-panel bg-card px-5 py-2">
        {visible.map((entry) => (
          <div key={entry.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-subtle py-3.5 last:border-b-0">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[var(--ink-900)] ${
                  entry.bucket === "done" ? "bg-[var(--lime-300)]" : "bg-strong"
                }`}
              >
                {entry.bucket === "done" ? "✓" : "–"}
              </span>
              <span
                className={`text-sm leading-[1.4] text-balance font-medium ${
                  entry.bucket === "done" ? "text-primary" : "text-secondary"
                }`}
              >
                {entry.title}
              </span>
            </div>
            <span className="whitespace-nowrap text-[13px] font-medium text-secondary">{entry.rightLabel}</span>
            {entry.note && (
              <span className="col-span-2 pl-8 text-[13px] leading-[1.45] text-balance text-secondary">
                {entry.note}
              </span>
            )}
          </div>
        ))}
        {filtered.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="h-12 w-full text-sm font-medium text-accent"
          >
            {showAll ? "Show less" : `Show all ${filtered.length}`}
          </button>
        )}
      </div>
    </section>
  );
}
