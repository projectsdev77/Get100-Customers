"use client";

import { useEffect, useState } from "react";
import { CelebrationShell } from "./CelebrationShell";
import { CelebrationRing } from "./CelebrationRing";
import { DecorativeImage } from "./DecorativeImage";
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
      className="overflow-y-auto overflow-x-hidden bg-[var(--violet-200)] text-[var(--ink-900)]"
    >
      <div className="celebration-stage flex min-h-full flex-col items-center justify-center gap-10 px-4 py-16">
        <CelebrationRing fill="var(--violet-100)" track="#FFFFFF" progress={count / 100}>
          <span className="absolute inset-0 grid place-items-center font-light text-[calc(96px*var(--celebration-scale))] leading-none tracking-[-0.04em]">
            {count}
          </span>
        </CelebrationRing>
        <div className="flex max-w-[560px] flex-col items-center gap-3.5 text-center">
          <span className="font-mono text-[13px] font-semibold leading-none tracking-[0.16em] text-[var(--violet-600)]">
            MILESTONE
          </span>
          <h2 className="celebration-headline font-medium leading-[1.05] tracking-[-0.02em]">100 customers.</h2>
        </div>
      </div>

      <div
        data-mode="growth"
        className={`celebration-stage absolute inset-0 overflow-y-auto overflow-x-hidden bg-growth-hero text-[var(--ink-900)] transition-[clip-path] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
          revealed ? "[clip-path:circle(160%_at_50%_40%)]" : "[clip-path:circle(0%_at_50%_40%)]"
        }`}
      >
        <div className="flex min-h-full flex-col items-center justify-center gap-10 px-4 py-16">
          <CelebrationRing
            fill="var(--lime-200)"
            track="#FFFFFF"
            progress={100 / 250}
            badge={
              <span className="absolute -bottom-[18px] rounded-full bg-[var(--ink-900)] px-4 py-2 font-mono text-sm font-semibold leading-none text-white">
                100 / 250
              </span>
            }
          >
            <DecorativeImage
              src={ILLUSTRATIONS.growthMode}
              className="relative w-[calc(560px*var(--celebration-scale))] max-w-none mb-[calc(90px*var(--celebration-scale))] object-contain"
            />
          </CelebrationRing>
          <div
            className={`flex max-w-[560px] flex-col items-center gap-3.5 text-center transition-opacity duration-[400ms] ${
              copyVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="font-mono text-[13px] font-semibold leading-none tracking-[0.16em]">GROWTH MODE</span>
            <h2
              id="celebration-growth-mode-title"
              className="celebration-headline font-medium leading-[1.05] tracking-[-0.02em] text-balance"
            >
              Welcome to Growth Mode.
            </h2>
            <p className="text-lg leading-[1.45] text-pretty">
              Your first 100 is done. Next target: 250. Same quests, bigger goal.
            </p>
            <button
              type="button"
              onClick={onEnter}
              className="mt-2.5 rounded-full bg-[var(--ink-900)] px-6 py-3.5 text-[15px] font-semibold leading-none text-white"
            >
              Enter Growth Mode
            </button>
          </div>
        </div>
      </div>
    </CelebrationShell>
  );
}
