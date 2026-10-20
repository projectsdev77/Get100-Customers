"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFocusTrap } from "./useFocusTrap";

// Shared chrome for every blocking celebration (level-up, milestones,
// Growth Mode): role="dialog" + aria-modal, Esc to close, optional
// click-anywhere-to-close, and pause callbacks for a parent-managed
// auto-close timer. No modal/dialog existed anywhere in this app before
// this, so there's no prior convention to break.
export function CelebrationShell({
  labelledBy,
  onClose,
  closeOnClickAnywhere = false,
  onPauseChange,
  children,
  className = "",
}: {
  labelledBy: string;
  onClose: () => void;
  closeOnClickAnywhere?: boolean;
  onPauseChange?: (paused: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={closeOnClickAnywhere ? onClose : undefined}
      onMouseEnter={() => onPauseChange?.(true)}
      onMouseLeave={() => onPauseChange?.(false)}
      onFocus={() => onPauseChange?.(true)}
      onBlur={() => onPauseChange?.(false)}
      className={`fixed inset-0 z-50 ${className}`}
    >
      {children}
    </div>
  );
}

// 44px circle, top-right (handoff-ui-redesign §B). Fixed light colors since
// every celebration background is light in both themes.
export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="absolute right-6 top-6 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-normal leading-none text-[var(--ink-900)]"
    >
      ×
    </button>
  );
}
