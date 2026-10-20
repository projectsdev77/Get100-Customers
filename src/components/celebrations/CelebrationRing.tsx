import type { ReactNode } from "react";

const RADIUS = 193;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// The 400px ring from handoff-ui-redesign §B (280px on phones via
// --celebration-scale). Purely decorative: the illustration sits inside it,
// bottom-anchored, and is allowed to spill past the edge. Pass `progress`
// (0-1) for a partial arc over `track`; omit it for a full ring.
export function CelebrationRing({
  fill,
  track = "var(--ink-900)",
  progress,
  badge,
  children,
}: {
  fill: string;
  track?: string;
  progress?: number;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  const arc = progress == null ? null : Math.max(0, Math.min(1, progress)) * CIRCUMFERENCE;

  return (
    <div className="relative flex size-[calc(400px*var(--celebration-scale))] shrink-0 items-end justify-center">
      <svg viewBox="0 0 400 400" aria-hidden="true" className="absolute inset-0 -rotate-90">
        <circle cx="200" cy="200" r={RADIUS} fill={fill} stroke={track} strokeWidth="14" />
        {arc != null && (
          <circle
            cx="200"
            cy="200"
            r={RADIUS}
            fill="none"
            stroke="var(--ink-900)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRCUMFERENCE}`}
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
        )}
      </svg>
      {children}
      {badge}
    </div>
  );
}
