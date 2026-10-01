"use client";

import { useState } from "react";

// Every illustration in this handoff is decorative (alt="" + aria-hidden,
// per README §6) and must fail safely — a missing/failed image renders
// nothing, never a broken-image icon (no empty gap left behind, since this
// renders null rather than keeping a sized placeholder). loading="lazy"
// everywhere except the hero (06-illustration-placement §6), which passes
// eager since it's always above the fold.
export function DecorativeImage({
  src,
  className,
  eager = false,
}: {
  src: string;
  className?: string;
  eager?: boolean;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
      onError={() => setOk(false)}
    />
  );
}
