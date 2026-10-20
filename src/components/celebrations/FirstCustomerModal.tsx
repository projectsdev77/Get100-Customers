"use client";

import { useEffect, useState } from "react";
import { CelebrationShell, CloseButton } from "./CelebrationShell";
import { confettiRain, prefersReducedMotion } from "./confetti";
import { ILLUSTRATIONS } from "@/lib/celebrations/illustrations";
import { DecorativeImage } from "./DecorativeImage";

// 1e "Full scene" — the only celebration that rains confetti (README §3),
// reserved for customer #1. Stays open until the founder taps the CTA, ×,
// or Esc (no auto-close).
export function FirstCustomerModal({ onClose }: { onClose: () => void }) {
  const reduced = prefersReducedMotion();
  const [revealed, setRevealed] = useState(reduced);

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
      className={`overflow-y-auto overflow-x-hidden bg-[var(--violet-200)] text-[var(--ink-900)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
        revealed ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div
        className="celebration-stage flex min-h-full flex-col items-center justify-center gap-10 px-4 py-16"
        onClick={(e) => e.stopPropagation()}
      >
        <DecorativeImage
          src={ILLUSTRATIONS.firstCustomer}
          className="h-[calc(400px*var(--celebration-scale))] max-w-none object-contain"
        />
        <div className="flex max-w-[560px] flex-col items-center gap-3.5 text-center">
          <span className="font-mono text-[13px] font-semibold leading-none tracking-[0.16em] text-[var(--violet-600)]">
            CUSTOMER № 1
          </span>
          <h2
            id="celebration-first-customer-title"
            className="celebration-headline font-medium leading-[1.05] tracking-[-0.02em] text-balance"
          >
            Your first customer.
          </h2>
          <p className="text-lg leading-[1.45] text-pretty text-[var(--ink-600)]">
            That&apos;s the hardest one. Everything after this builds on it.
          </p>
          <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[var(--ink-900)] px-6 py-3.5 text-[15px] font-semibold leading-none text-white"
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold leading-none text-[var(--ink-900)]"
            >
              Share it
            </button>
          </div>
        </div>
      </div>
      <CloseButton onClose={onClose} />
    </CelebrationShell>
  );
}
