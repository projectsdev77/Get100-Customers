const HEIGHTS = { hair: "h-[3px]", thin: "h-[5px]", thick: "h-2" };

export function ProgressBar({
  value = 0,
  max = 100,
  size = "thin",
  colorClassName = "bg-on-tile",
  label,
}: {
  value?: number;
  max?: number;
  size?: "hair" | "thin" | "thick";
  colorClassName?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      aria-label={label}
      className={`w-full overflow-hidden rounded-full bg-[var(--ring-track)] ${HEIGHTS[size]}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-[600ms] ease-out ${colorClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
