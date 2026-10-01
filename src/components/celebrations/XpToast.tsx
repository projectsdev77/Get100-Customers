"use client";

import { useEffect, useState } from "react";
import { confettiBurst, prefersReducedMotion } from "./confetti";
import type { XpEvent } from "./types";

// 1a "Pill pop", adapted: the spec assumes an existing XpPill element on the
// quest card that pops in place, but the actual XP award happens on
// ReportCard (a bespoke form, not QuestCard — see
// src/app/(app)/quests/report-card.tsx), which has no XpPill to animate and
// disappears from the page the moment the quest completes. A standalone
// toast carries the same pill shape, count-up and burst without touching
// QuestCard or ReportCard. Non-blocking (aria-live="polite"), auto-closes.
export function XpToast({ event, onDone }: { event: XpEvent; onDone: () => void }) {
  const reduced = prefersReducedMotion();
  const [display, setDisplay] = useState(reduced ? event.amount : 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let frame: number | null = null;

    if (!reduced) {
      const duration = 600;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setDisplay(Math.round(t * event.amount));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      timers.push(setTimeout(() => confettiBurst(14, 0.5, 0.15), 60));
    }
    timers.push(setTimeout(onDone, reduced ? 1400 : 1700));

    return () => {
      if (frame) cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.key]);

  const xpIntoLevel = event.totalXp % 100;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-tile-level px-5 py-2.5 text-on-tile shadow-float transition-all duration-200 ease-out ${
        mounted ? "scale-100 opacity-100" : "scale-75 opacity-0"
      }`}
    >
      <span className="text-sm font-semibold">+{display} XP</span>
      <span className="ml-2 text-xs text-tile-level-ink">
        Level {event.level} · {xpIntoLevel} / 100 XP
      </span>
    </div>
  );
}
