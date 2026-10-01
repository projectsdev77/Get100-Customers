"use client";

import { useState } from "react";

// Every illustration in this handoff is decorative (alt="" + aria-hidden,
// per README §6) and must fail safely — a missing/failed image renders
// nothing, never a broken-image icon.
export function DecorativeImage({ src, className }: { src: string; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setOk(false)}
    />
  );
}
