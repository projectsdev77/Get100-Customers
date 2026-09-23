import type { ReactNode } from "react";

// Conic-gradient rings can't be expressed as static Tailwind utilities
// (the fill percentage is dynamic), so this is one of the few components
// that needs an inline style — everything else here is plain classes.
export function ProgressRing({
  value = 0,
  max = 100,
  size = "lg",
  color,
  track = "var(--ring-track)",
  center,
  label,
  children,
}: {
  value?: number;
  max?: number;
  size?: "lg" | "sm";
  color?: string;
  track?: string;
  center?: string;
  label?: string;
  children?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  const diameter = size === "lg" ? 132 : 60;
  const thickness = size === "lg" ? 12 : 6;
  const fill = color || (size === "lg" ? "var(--ring-customers)" : "var(--ring-level)");
  const bg = center || "var(--tile-customers)";

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      aria-label={label}
      className="grid shrink-0 place-items-center rounded-full transition-[background] duration-[600ms] ease-out"
      style={{
        width: diameter,
        height: diameter,
        background: `conic-gradient(${fill} 0 ${pct}%, ${track} ${pct}% 100%)`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full text-on-tile"
        style={{ width: diameter - thickness * 2, height: diameter - thickness * 2, background: bg }}
      >
        {children}
      </div>
    </div>
  );
}
