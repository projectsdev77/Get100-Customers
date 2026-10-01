"use client";

import { useEffect, useRef, useState } from "react";
import { CelebrationShell } from "./CelebrationShell";
import { ProgressRing } from "@/components/ui/game/ProgressRing";
import { confettiBurst, prefersReducedMotion } from "./confetti";

const AUTO_CLOSE_MS = 4000;

// 1c "Big number". Closes automatically after 4s; hover/focus pauses the
// countdown; tapping anywhere, Esc, or × closes early (README §2).
export function LevelUpModal({
  level,
  founderName,
  onClose,
}: {
  level: number;
  founderName: string | null;
  onClose: () => void;
}) {
  const reduced = prefersReducedMotion();
  const [revealed, setRevealed] = useState(reduced);
  const [ringFull, setRingFull] = useState(reduced);
  const [numberPopped, setNumberPopped] = useState(reduced);
  const [paused, setPaused] = useState(false);
  const [remainingMs, setRemainingMs] = useState(AUTO_CLOSE_MS);
  const closedRef = useRef(false);

  function closeOnce() {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }

  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setRevealed(true), 10);
    const t2 = setTimeout(() => setRingFull(true), 300);
    const t3 = setTimeout(() => setNumberPopped(true), 900);
    const t4 = setTimeout(() => confettiBurst(26, 0.5, 0.45), 900);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (paused) return;
      setRemainingMs((ms) => {
        const next = ms - 100;
        if (next <= 0) {
          clearInterval(interval);
          closeOnce();
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const countdownPct = (remainingMs / AUTO_CLOSE_MS) * 100;

  return (
    <CelebrationShell
      labelledBy="celebration-level-up-title"
      onClose={closeOnce}
      closeOnClickAnywhere
      onPauseChange={setPaused}
      className={`bg-tile-level text-on-tile transition-[clip-path,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
        reduced
          ? "opacity-100"
          : revealed
            ? "opacity-100 [clip-path:circle(150%_at_50%_92%)]"
            : "opacity-100 [clip-path:circle(0%_at_50%_92%)]"
      }`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-3.5 px-6">
        <div
          role="button"
          tabIndex={0}
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            closeOnce();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") closeOnce();
          }}
          className="absolute right-4.5 top-4.5 grid h-11 w-11 cursor-pointer place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--ink-900) ${countdownPct}%, var(--tile-level) ${countdownPct}%)`,
          }}
        >
          <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-tile-level text-xl font-normal leading-none">
            ×
          </div>
        </div>

        <span className="font-mono text-xs font-semibold tracking-[0.14em]">LEVEL UP</span>

        <ProgressRing
          value={ringFull ? 100 : 88}
          max={100}
          diameterPx={190}
          thicknessPx={14}
          color="var(--ink-900)"
          center="var(--tile-level)"
          label="Level progress"
        >
          <span
            className={`font-light text-[72px] leading-none tracking-[-0.05em] transition-transform duration-[250ms] ${
              numberPopped ? "scale-100" : "scale-[1.3]"
            }`}
          >
            {level}
          </span>
        </ProgressRing>

        <div
          className={`flex flex-col items-center gap-1.5 text-center transition-all duration-300 ${
            numberPopped ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <h2 id="celebration-level-up-title" className="text-2xl font-medium tracking-[-0.02em]">
            Level {level}
          </h2>
          <p className="max-w-[360px] text-[15px] leading-[1.45] text-tile-level-ink">
            {founderName ? `${founderName}, the` : "The"} quests are working. Keep the streak going.
          </p>
        </div>
      </div>
    </CelebrationShell>
  );
}
