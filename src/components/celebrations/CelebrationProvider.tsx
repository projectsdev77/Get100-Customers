"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CUSTOMER_MILESTONES, crossedCustomerMilestone } from "@/lib/notifications/milestones";
import { isInGrowthMode } from "@/lib/gamification/growth-mode";
import { CELEBRATIONS_ENABLED } from "@/lib/celebrations/flag";
import type { CelebrationEvent, FounderSnapshot, XpEvent } from "./types";
import { XpToast } from "./XpToast";
import { LevelUpModal } from "./LevelUpModal";
import { FirstCustomerModal } from "./FirstCustomerModal";
import { MilestoneModal } from "./MilestoneModal";
import { GrowthModeModal } from "./GrowthModeModal";

const GROWTH_MODE_STORAGE_KEY = "g100_entered_growth_mode";

interface CelebrationContextValue {
  reportSnapshot: (snapshot: FounderSnapshot) => void;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

// Mounted once in src/app/(app)/layout.tsx. Pages report their
// server-rendered xp/level/customer-count via useCelebrationSnapshot; this
// diffs each report against the last known values to derive events — no
// backend change needed since submitQuestResult/logCustomer/
// correctCustomerCount already persist these fields, this just watches them
// change (see README §1 for the queue-ordering rules this implements).
export function CelebrationProvider({
  initialSnapshot,
  children,
}: {
  initialSnapshot: FounderSnapshot;
  children: React.ReactNode;
}) {
  const prevRef = useRef<FounderSnapshot>(initialSnapshot);
  const [xpEvent, setXpEvent] = useState<XpEvent | null>(null);
  const [blockingQueue, setBlockingQueue] = useState<CelebrationEvent[]>([]);
  const xpKeyRef = useRef(0);
  // Derived from the queue itself (not a separate state+effect pair) so
  // advancing just means shifting the queue — nothing to keep in sync.
  const active = blockingQueue[0] ?? null;

  // Ambient Growth Mode theme: driven by real data (not just the one-time
  // celebration), so a founder already past 100 customers before this
  // shipped — or who refreshes after crossing it — still sees the right
  // theme. The celebration below is only the animated first-time transition.
  const [growthModeTheme, setGrowthModeTheme] = useState(() => isInGrowthMode(initialSnapshot.customers));

  useEffect(() => {
    if (!growthModeTheme) {
      document.documentElement.removeAttribute("data-mode");
      return;
    }
    document.documentElement.setAttribute("data-mode", "growth");
  }, [growthModeTheme]);

  const reportSnapshot = useCallback((snapshot: FounderSnapshot) => {
    const prev = prevRef.current;
    prevRef.current = snapshot;
    if (isInGrowthMode(snapshot.customers)) setGrowthModeTheme(true);
    if (!CELEBRATIONS_ENABLED) return;

    const xpGained = snapshot.xp - prev.xp;
    const leveledUp = snapshot.level > prev.level;
    const milestone = crossedCustomerMilestone(prev.customers, snapshot.customers);

    if (xpGained > 0) {
      xpKeyRef.current += 1;
      setXpEvent({ amount: xpGained, totalXp: snapshot.xp, level: snapshot.level, key: xpKeyRef.current });
    }

    const newBlocking: CelebrationEvent[] = [];
    if (milestone) {
      if (milestone === 1) {
        newBlocking.push({ kind: "first-customer" });
      } else if (milestone === 100) {
        newBlocking.push({ kind: "growth-mode" });
      } else {
        const idx = CUSTOMER_MILESTONES.indexOf(milestone);
        const previousMilestone = idx > 0 ? CUSTOMER_MILESTONES[idx - 1] : 0;
        newBlocking.push({ kind: "milestone", milestone, previousMilestone });
      }
    } else if (leveledUp) {
      newBlocking.push({ kind: "level", level: snapshot.level, prevLevel: prev.level });
    }

    if (newBlocking.length > 0) {
      // XP plays first and the next event starts at t=1000ms (README §3) —
      // approximated with a flat delay before the blocking event enters the
      // queue when an XP gain fired in the same report.
      if (xpGained > 0) {
        setTimeout(() => setBlockingQueue((q) => [...q, ...newBlocking]), 1000);
      } else {
        setBlockingQueue((q) => [...q, ...newBlocking]);
      }
    }
  }, []);

  function closeActive() {
    setBlockingQueue((q) => q.slice(1));
  }

  function enterGrowthMode() {
    try {
      window.localStorage.setItem(GROWTH_MODE_STORAGE_KEY, "1");
    } catch {
      // Storage unavailable (private mode, blocked) — ambient theme already
      // follows real customer count regardless, so this is a no-op, not a failure.
    }
    closeActive();
  }

  return (
    <CelebrationContext.Provider value={{ reportSnapshot }}>
      {children}
      {CELEBRATIONS_ENABLED && xpEvent && <XpToast key={xpEvent.key} event={xpEvent} onDone={() => setXpEvent(null)} />}
      {CELEBRATIONS_ENABLED && active?.kind === "level" && (
        <LevelUpModal level={active.level} founderName={initialSnapshot.founderName} onClose={closeActive} />
      )}
      {CELEBRATIONS_ENABLED && active?.kind === "first-customer" && <FirstCustomerModal onClose={closeActive} />}
      {CELEBRATIONS_ENABLED && active?.kind === "milestone" && (
        <MilestoneModal milestone={active.milestone} previousMilestone={active.previousMilestone} onClose={closeActive} />
      )}
      {CELEBRATIONS_ENABLED && active?.kind === "growth-mode" && <GrowthModeModal onEnter={enterGrowthMode} />}
    </CelebrationContext.Provider>
  );
}

export function useCelebrationSnapshot(snapshot: FounderSnapshot) {
  const ctx = useContext(CelebrationContext);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!ctx) return;
    // The provider seeds its own baseline from the layout's initial
    // snapshot, so a reporter's very first call on mount would otherwise
    // re-report the same values the provider already has as "new" — only
    // report after this instance has observed at least one change.
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    ctx.reportSnapshot(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, snapshot.xp, snapshot.level, snapshot.customers]);
}
