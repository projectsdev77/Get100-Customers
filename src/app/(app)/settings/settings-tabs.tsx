"use client";

import { useState, type ReactNode } from "react";

export interface SettingsSection {
  id: string;
  label: string;
  content: ReactNode;
}

// Server Components (BillingSection etc.) render fully on the server
// regardless of which tab is active — this just controls which one is
// visible, so the sidebar can switch sections without a page reload or
// a giant single-page scroll.
export function SettingsTabs({
  sections,
  initialTabId,
}: {
  sections: SettingsSection[];
  initialTabId?: string;
}) {
  const [activeId, setActiveId] = useState(
    sections.find((s) => s.id === initialTabId)?.id ?? sections[0]?.id,
  );

  // Switching tabs only ever changed this component's own state, never the
  // URL — so a reload always re-ran page.tsx with no `tab` search param and
  // landed back on the first section (business profile) regardless of which
  // tab was open. Updating the URL via the plain History API (rather than
  // next/navigation's router) keeps the fix purely cosmetic for reload/
  // bookmark/share purposes without reintroducing a server round-trip on
  // every tab click, which is the whole reason this component manages
  // switching client-side in the first place (see the comment above).
  function selectTab(id: string) {
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
      <nav className="flex gap-1 overflow-x-auto pb-1 sm:w-[180px] sm:shrink-0 sm:flex-col sm:overflow-visible sm:pb-0">
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => selectTab(section.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-left text-sm font-medium transition-colors duration-200 sm:whitespace-normal sm:rounded-tile ${
                active ? "bg-card text-primary" : "text-secondary hover:text-primary"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 max-w-[560px] flex-1">
        {sections.map((section) => (
          <div key={section.id} className={section.id === activeId ? "block" : "hidden"}>
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
}
