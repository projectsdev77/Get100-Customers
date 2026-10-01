// Event queue logic per the handoff (README §1): XP always plays first,
// a milestone replaces a level-up when both happen together, and only the
// highest milestone shows when several are crossed in one correction
// (crossedCustomerMilestone already returns only the highest).
export type CelebrationEvent =
  | { kind: "level"; level: number; prevLevel: number }
  | { kind: "first-customer" }
  | { kind: "milestone"; milestone: number; previousMilestone: number }
  | { kind: "growth-mode" };

export interface XpEvent {
  amount: number;
  totalXp: number;
  level: number;
  key: number;
}

export interface FounderSnapshot {
  xp: number;
  level: number;
  customers: number;
  founderName: string | null;
}
