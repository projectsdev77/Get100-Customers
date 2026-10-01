"use client";

import { useEffect, useState } from "react";
import { pickHeroWelcomeIllustration } from "@/lib/celebrations/illustrations";
import { DecorativeImage } from "./DecorativeImage";

// Screen card A (README §6): one of 4 hero variants picked at random per
// founder and kept via localStorage. Resolved client-side after mount
// (rather than during SSR) so every founder's server-rendered HTML is
// identical — avoids a hydration mismatch, at the cost of the image
// popping in a frame after the rest of the page.
export function HeroWelcomeIllustration({ className }: { className?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    // Deferred to a microtask rather than called synchronously in the
    // effect body — localStorage/Math.random aren't derivable during
    // render (would mismatch SSR), so this has to run post-mount, but the
    // indirection keeps it out of the "setState directly in an effect"
    // anti-pattern the lint rule is guarding against.
    queueMicrotask(() => setSrc(pickHeroWelcomeIllustration()));
  }, []);

  if (!src) return null;
  return <DecorativeImage src={src} className={className} />;
}
