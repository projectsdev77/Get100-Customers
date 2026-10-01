import confetti from "canvas-confetti";

// 7 brand tokens, per the handoff's confetti spec (README §3).
const CONFETTI_COLORS = [
  "#5B4BC4", // violet-600
  "#D6F36A", // lime-300
  "#A99CFF", // violet-400
  "#D5E4EE", // sky-200
  "#F6E6B0", // butter-200
  "#1A1633", // ink-900
  "#DCD6F7", // violet-200
];

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// canvas-confetti only ships 'circle'/'square' built-in shapes; the spec's
// pill (12x5) isn't worth a custom Path2D shape for a decorative burst, so
// circle+square covers the 7-color/2-shape brief closely enough.
function burst(originX: number, originY: number, particleCount: number, spread: number) {
  if (prefersReducedMotion()) return;
  void confetti({
    particleCount,
    spread,
    startVelocity: 32,
    gravity: 0.9,
    ticks: 90,
    origin: { x: originX, y: originY },
    colors: CONFETTI_COLORS,
    shapes: ["circle", "square"],
    scalar: 0.8,
    disableForReducedMotion: true,
  });
}

// Rain spans the full width from the top — used only for the first-customer
// celebration (1e), the one moment the handoff calls out as uniquely
// "raining" rather than bursting from a point.
export function confettiRain(particleCount = 34) {
  if (prefersReducedMotion()) return;
  void confetti({
    particleCount,
    startVelocity: 18,
    gravity: 0.6,
    ticks: 140,
    spread: 90,
    angle: 270,
    origin: { x: 0.5, y: -0.1 },
    colors: CONFETTI_COLORS,
    shapes: ["circle", "square"],
    scalar: 0.8,
    disableForReducedMotion: true,
  });
}

export function confettiBurst(particleCount: number, originX = 0.5, originY = 0.5) {
  burst(originX, originY, particleCount, 70);
}
