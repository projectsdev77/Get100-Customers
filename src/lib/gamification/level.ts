// Cosmetic leveling, no feature-gating by level (SPEC §6). 100 XP per level.
const XP_PER_LEVEL = 100;

export function computeLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoCurrentLevel(xp: number): { current: number; target: number } {
  return { current: xp % XP_PER_LEVEL, target: XP_PER_LEVEL };
}
