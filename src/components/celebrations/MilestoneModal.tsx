"use client";

import { useEffect, useState } from "react";
import { CelebrationShell, CloseButton } from "./CelebrationShell";
import { CelebrationRing } from "./CelebrationRing";
import { DecorativeImage } from "./DecorativeImage";
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
// The ring only frames the team scene (100-999); the desk and rooftop scenes
// stand on their own.
function sceneFor(milestone: number) {
  const src = milestoneCelebrationIllustration(milestone);
  if (milestone >= 1000) {
    return { src, ring: false, className: "w-[calc(540px*var(--celebration-scale))]" };
  }
  if (milestone >= 100) {
    return {
      src,
      ring: true,
      className: "h-[calc(400px*var(--celebration-scale))] mb-[calc(28px*var(--celebration-scale))]",
    };
  }
  return { src, ring: false, className: "h-[calc(400px*var(--celebration-scale))]" };
}

// Ring takeover, for every milestone except 1 (FirstCustomerModal) and
// 100 (GrowthModeModal). Stays open until the founder taps the CTA, ×, or
// Esc.
export function MilestoneModal({
  milestone,
  onClose,
}: {
  milestone: number;
  previousMilestone: number;
  onClose: () => void;
}) {
  const reduced = prefersReducedMotion();
  const [bgVisible, setBgVisible] = useState(reduced);
  const [copyVisible, setCopyVisible] = useState(reduced);
  const copy = copyFor(milestone);
  const scene = sceneFor(milestone);
  const image = (
    <DecorativeImage src={scene.src} className={`relative max-w-none object-contain ${scene.className}`} />
  );

  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setBgVisible(true), 10);
    const t2 = setTimeout(() => setCopyVisible(true), 400);
    const t3 = setTimeout(() => confettiBurst(24, 0.3, 0.5), 1100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [reduced]);

  return (
    <CelebrationShell
      labelledBy="celebration-milestone-title"
      onClose={onClose}
      className={`overflow-y-auto overflow-x-hidden bg-[var(--violet-200)] text-[var(--ink-900)] transition-opacity duration-300 ${
        bgVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="celebration-stage flex min-h-full flex-col items-center justify-center gap-10 px-4 py-16"
        onClick={(e) => e.stopPropagation()}
      >
        {scene.ring ? <CelebrationRing fill="var(--violet-100)">{image}</CelebrationRing> : image}

        <div
          className={`flex max-w-[560px] flex-col items-center gap-3.5 text-center transition-all duration-300 ${
            copyVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <span className="font-mono text-[13px] font-semibold leading-none tracking-[0.16em] text-[var(--violet-600)]">
            {copy.eyebrow}
          </span>
          <h2
            id="celebration-milestone-title"
            className="celebration-headline font-medium leading-[1.05] tracking-[-0.02em] text-balance"
          >
            {copy.headline}
          </h2>
          <p className="text-lg leading-[1.45] text-pretty text-[var(--ink-600)]">{copy.body}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2.5 rounded-full bg-[var(--ink-900)] px-6 py-3.5 text-[15px] font-semibold leading-none text-white"
          >
            Keep going
          </button>
        </div>
      </div>
      <CloseButton onClose={onClose} />
    </CelebrationShell>
  );
}
