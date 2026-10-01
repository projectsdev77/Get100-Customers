"use client";

import { useEffect, useState } from "react";
import { CelebrationShell } from "./CelebrationShell";
import { ProgressRing } from "@/components/ui/game/ProgressRing";
import { confettiBurst, prefersReducedMotion } from "./confetti";
import { milestoneCelebrationIllustration } from "@/lib/celebrations/illustrations";

// README §4 copy table. 10/25/50 have bespoke headlines; 250/500/1,000+
// follow the stated "{n} customers." pattern with no bespoke headline given.
const HEADLINES: Record<number, string> = {
  10: "Double digits.",
  25: "A quarter of the way.",
  50: "Halfway to 100.",
};
const BODIES: Record<number, string> = {
  10: "Ten people chose what you built. That's a pattern, not luck.",
  25: "Your first 100 is starting to look real.",
  50: "Same quests, same streak. The next fifty are yours.",
  250: "Growth Mode is paying off. Next stop: 500.",
  500: "Half a thousand. Your next target is 1,000.",
};

function copyFor(milestone: number) {
  const headline = HEADLINES[milestone] ?? `${milestone.toLocaleString()} customers.`;
  const body = BODIES[milestone] ?? "Four digits. Take a minute, then set the next target.";
  return { eyebrow: `YOU'VE HIT ${milestone.toLocaleString()} CUSTOMERS`, headline, body };
}

// 1g "Ring takeover", for every milestone except 1 (FirstCustomerModal) and
// 100 (GrowthModeModal). Stays open until the founder taps the CTA, ×, or
// Esc.
export function MilestoneModal({
  milestone,
  previousMilestone,
  onClose,
}: {
  milestone: number;
  previousMilestone: number;
  onClose: () => void;
}) {
  const reduced = prefersReducedMotion();
  const [bgVisible, setBgVisible] = useState(reduced);
  const [count, setCount] = useState(reduced ? milestone : previousMilestone);
  const [copyVisible, setCopyVisible] = useState(reduced);
  const [imgOk, setImgOk] = useState(true);
  const copy = copyFor(milestone);

  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setBgVisible(true), 10);
    const t2 = setTimeout(() => setCopyVisible(true), 400);
    const t3 = setTimeout(() => confettiBurst(24, 0.3, 0.5), 1100);

    const duration = 800;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setCount(Math.round(previousMilestone + t * (milestone - previousMilestone)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const rafTimer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 300);

    return () => {
      [t1, t2, t3, rafTimer].forEach(clearTimeout);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, milestone, previousMilestone]);

  return (
    <CelebrationShell
      labelledBy="celebration-milestone-title"
      onClose={onClose}
      className={`bg-tile-customers text-on-tile transition-opacity duration-300 ${
        bgVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="grid h-full grid-cols-1 items-center gap-7 p-8 sm:grid-cols-[200px_1fr] sm:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        <ProgressRing
          value={reduced ? 1 : count}
          max={1}
          diameterPx={200}
          thicknessPx={15}
          color="var(--ink-900)"
          center="var(--tile-customers)"
          label="Milestone progress"
        >
          <span className="font-light text-[56px] leading-none tracking-[-0.04em]">{count}</span>
          <span className="text-xs font-medium text-tile-customers-ink">of {milestone}</span>
        </ProgressRing>

        <div
          className={`flex flex-col gap-3 transition-all duration-300 ${
            copyVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {imgOk && (
            <div className="relative h-[140px] overflow-hidden rounded-[18px] bg-white/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={milestoneCelebrationIllustration(milestone)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-contain"
                onError={() => setImgOk(false)}
              />
            </div>
          )}
          <span className="font-mono text-xs font-semibold tracking-[0.14em] text-tile-customers-ink">
            {copy.eyebrow}
          </span>
          <h2 id="celebration-milestone-title" className="text-[30px] font-medium leading-[1.1] tracking-[-0.03em]">
            {copy.headline}
          </h2>
          <p className="max-w-[420px] text-sm leading-[1.5] text-tile-customers-ink">{copy.body}</p>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-fit rounded-full bg-[var(--ink-900)] px-5 text-sm font-medium text-white"
          >
            Keep going
          </button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4.5 top-4.5 grid h-11 w-11 place-items-center rounded-full bg-white/70 text-xl font-normal leading-none text-[var(--ink-900)]"
      >
        ×
      </button>
    </CelebrationShell>
  );
}
