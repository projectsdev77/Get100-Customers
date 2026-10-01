"use client";

import { useCelebrationSnapshot } from "./CelebrationProvider";

// Tiny client bridge so server-rendered pages (dashboard, quests, settings)
// can feed their fresh founder.xp/level/current_customer_count into the
// celebration engine without becoming client components themselves. Renders
// nothing.
export function CelebrationSnapshot({
  xp,
  level,
  customers,
  founderName,
}: {
  xp: number;
  level: number;
  customers: number;
  founderName: string | null;
}) {
  useCelebrationSnapshot({ xp, level, customers, founderName });
  return null;
}
