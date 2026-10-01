"use client";

import { useState } from "react";
import type { NotificationLogEntry } from "@/types/database";

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  new_quest: "New quest",
  window_approaching: "Quest due soon",
  re_engagement: "Re-engagement",
  milestone: "Milestone",
  weekly_recap: "Weekly recap",
  quest_check_in: "Quest check-in",
  admin_message: "Message from support",
};

const PAGE_SIZE = 10;

// Answers "did they actually get that email" and keeps an audit trail of
// support's own messages — the two things a support question actually
// needs. Everything else here (new_quest, milestone, etc.) is routine
// in-app noise logged on every quest generation; for an active founder it
// drowns out the two useful signals, so it's hidden by default rather than
// dumping the full firehose. This only confirms a send was attempted and
// logged (notify.ts), not that an email was actually delivered.
function isUseful(n: NotificationLogEntry): boolean {
  return n.channel === "email" || n.type === "admin_message";
}

export function NotificationHistory({ entries }: { entries: NotificationLogEntry[] }) {
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const useful = entries.filter(isUseful);
  const visibleEntries = showAll ? entries : useful;
  const shown = visibleEntries.slice(0, visibleCount);
  const hasMore = visibleEntries.length > shown.length;

  function toggleShowAll() {
    setShowAll((v) => !v);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-secondary">
          {showAll
            ? `All activity (${entries.length} of the last 50 fetched).`
            : `Emails and support messages only (${useful.length} of the last 50 fetched) — the rest is routine quest-generation noise.`}
        </p>
        <button
          type="button"
          onClick={toggleShowAll}
          className="whitespace-nowrap text-[13px] font-medium text-accent hover:underline"
        >
          {showAll ? "Show only emails & messages" : "Show all activity"}
        </button>
      </div>

      {shown.length > 0 ? (
        <div className="flex flex-col">
          {shown.map((n, i) => (
            <div
              key={n.id}
              className={`flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm ${
                i > 0 ? "border-t border-subtle" : ""
              }`}
            >
              <span className="w-[108px] shrink-0 font-mono text-[12px] text-secondary">
                {new Date(n.sent_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span className="w-20 shrink-0 text-[12px] font-medium uppercase tracking-[0.04em] text-secondary">
                {n.channel === "email" ? "Email" : "In-app"}
              </span>
              <span className="min-w-[140px] shrink-0 text-primary">
                {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
              </span>
              <span className="min-w-0 flex-1 truncate text-secondary">{n.message}</span>
              {n.channel === "in_app" && (
                <span className="shrink-0 text-[12px] text-secondary">
                  {n.read_at ? "Read" : "Unread"}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-secondary">
          {showAll ? "No notifications logged yet." : "No emails or support messages logged yet."}
        </p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          className="self-start text-[13px] font-medium text-accent hover:underline"
        >
          Show {Math.min(PAGE_SIZE, visibleEntries.length - shown.length)} more
        </button>
      )}
    </div>
  );
}
