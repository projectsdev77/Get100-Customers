"use client";

import { useEffect, useState } from "react";
import { CelebrationShell } from "./CelebrationShell";
import { confettiRain, prefersReducedMotion } from "./confetti";
import { ILLUSTRATIONS } from "@/lib/celebrations/illustrations";

// 1e "Full scene" — the only celebration that rains confetti (README §3),
// reserved for customer #1. Stays open until the founder taps the CTA, ×,
// or Esc (no auto-close).
export function FirstCustomerModal({ onClose }: { onClose: () => void }) {
  const reduced = prefersReducedMotion();
  const [revealed, setRevealed] = useState(reduced);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setRevealed(true), 10);
    const t2 = setTimeout(() => confettiRain(34), 500);
    return () => [t1, t2].forEach(clearTimeout);
  }, [reduced]);

  function handleShare() {
    const text = "I just got my first customer on Get100-Customers.";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return (
    <CelebrationShell
      labelledBy="celebration-first-customer-title"
      onClose={onClose}
      className={`bg-tile-customers text-on-tile transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
        revealed ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div
        className="grid h-full grid-cols-1 items-center gap-6 p-8 sm:grid-cols-2 sm:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-xs font-semibold tracking-[0.14em] text-tile-customers-ink">
            CUSTOMER № 1
          </span>
          <h2 id="celebration-first-customer-title" className="text-4xl font-medium leading-[1.05] tracking-[-0.035em]">
            Your first customer.
          </h2>
          <p className="max-w-[360px] text-[15px] leading-[1.5] text-tile-customers-ink">
            That&apos;s the hardest one. Everything after this builds on it.
          </p>
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full bg-[var(--ink-900)] px-5 text-sm font-medium text-white"
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="h-11 rounded-full bg-white/70 px-4.5 text-sm font-medium text-[var(--ink-900)]"
            >
              Share it
            </button>
          </div>
        </div>
        {imgOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ILLUSTRATIONS.firstCustomer}
            alt=""
            aria-hidden="true"
            className="max-w-[280px] justify-self-center object-contain"
            onError={() => setImgOk(false)}
          />
        )}
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
