import type { HTMLAttributes } from "react";

type Tone = "default" | "sunken" | "customers" | "level" | "streak";

const TONE_BG: Record<Tone, string> = {
  default: "bg-card",
  sunken: "bg-sunken",
  customers: "bg-tile-customers",
  level: "bg-tile-level",
  streak: "bg-tile-streak",
};

const TILE_TONES: Tone[] = ["customers", "level", "streak"];

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  radius?: "tile" | "panel";
}

export function Card({ tone = "default", radius = "panel", className = "", ...props }: CardProps) {
  const isTile = TILE_TONES.includes(tone);
  return (
    <div
      {...props}
      className={`${TONE_BG[tone]} ${radius === "tile" ? "rounded-tile" : "rounded-panel"} ${
        isTile ? "text-on-tile" : "text-primary"
      } ${className}`}
    />
  );
}

// Tray pattern (handoff): stat tiles sit inside a white card with 8px
// padding/gaps so the group reads as one object.
export function Tray({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`flex flex-col gap-2 rounded-panel bg-card p-2 ${className}`}
    />
  );
}
