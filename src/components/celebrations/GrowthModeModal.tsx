"use client";

import { useEffect, useState } from "react";
import { CelebrationShell } from "./CelebrationShell";
import { ProgressRing } from "@/components/ui/game/ProgressRing";
import { confettiBurst, prefersReducedMotion } from "./confetti";
import { ILLUSTRATIONS } from "@/lib/celebrations/illustrations";

// 1i "Colour takeover" — the one celebration the handoff says closes only
// via its own CTA, not click-anywhere/×. Esc is still honored here as an
// accessibility safety valve (never trapping a keyboard user with a single
// mouse-only way out), which is a deliberate, minor deviation from the
// literal spec in favor of not shipping an inescapable dialog.
export function GrowthModeModal({ onEnter }: { onEnter: () => void }) {
  const reduced = prefersReducedMotion();
  const [count, setCount] = useState(reduced ? 100 : 97);
  const [revealed, setRevealed] = useState(reduced);
  const [copyVisible, setCopyVisible] = useState(reduced);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const duration = 700;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setCount(Math.round(97 + t * 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const t1 = setTimeout(() => setRevealed(true), 1200);
    const t2 = setTimeout(() => confettiBurst(30, 0.35, 0.5), 1200);
    const t3 = setTimeout(() => setCopyVisible(true), 1500);

    return () => {
      cancelAnimationFrame(frame);
      [t1, t2, t3].forEach(clearTimeout);
    };
  }, [reduced]);

  return (
    <CelebrationShell
      labelledBy="celebration-growth-mode-title"
      onClose={onEnter}
      className="bg-tile-customers text-on-tile"
    >
      <div className="grid h-full grid-cols-1 items-center gap-7 p-8 sm:grid-cols-[200px_1fr] sm:p-9">
        <ProgressRing
          value={count}
          max={100}
          diameterPx={200}
          thicknessPx={15}
          color="var(--ink-900)"
          center="var(--tile-customers)"
          label="Milestone progress"
        >
          <span className="font-light text-[56px] leading-none tracking-[-0.04em]">{count}</span>
          <span className="text-xs font-medium text-tile-customers-ink">of 100</span>
        </ProgressRing>
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs font-semibold tracking-[0.14em] text-tile-customers-ink">
            MILESTONE
          </span>
          <h2 className="text-4xl font-medium leading-[1.05] tracking-[-0.035em]">100 customers.</h2>
        </div>
      </div>

      <div
        data-mode="growth"
        className={`absolute inset-0 grid grid-cols-1 items-center gap-7 bg-growth-hero p-8 text-[var(--ink-900)] transition-[clip-path] duration-700 ease-[cubic-bezier(.22,1,.36,1)] sm:grid-cols-[200px_1fr] sm:p-9 ${
          revealed ? "[clip-path:circle(160%_at_23%_50%)]" : "[clip-path:circle(0%_at_23%_50%)]"
        }`}
      >
        <ProgressRing
          value={100}
          max={250}
          diameterPx={200}
          thicknessPx={15}
          color="var(--ink-900)"
          center="var(--growth-hero)"
          label="Next target progress"
        >
          <span className="font-light text-[56px] leading-none tracking-[-0.04em]">100</span>
          <span className="text-xs font-medium">of 250</span>
        </ProgressRing>
        <div
          className={`flex flex-col gap-3 transition-opacity duration-[400ms] ${
            copyVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {imgOk && (
            <div className="relative h-[120px] overflow-hidden rounded-[18px] bg-white/45">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ILLUSTRATIONS.growthMode}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-contain"
                onError={() => setImgOk(false)}
              />
            </div>
          )}
          <span className="font-mono text-xs font-semibold tracking-[0.14em]">GROWTH MODE</span>
          <h2 id="celebration-growth-mode-title" className="text-[30px] font-medium leading-[1.1] tracking-[-0.03em]">
            Welcome to Growth Mode.
          </h2>
          <p className="max-w-[420px] text-sm leading-[1.5]">
            Your first 100 is done. Next target: 250. Same quests, bigger goal.
          </p>
          <button
            type="button"
            onClick={onEnter}
            className="h-11 w-fit rounded-full bg-[var(--ink-900)] px-5 text-sm font-medium text-white"
          >
            Enter Growth Mode
          </button>
        </div>
      </div>
    </CelebrationShell>
  );
}
