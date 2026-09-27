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
export function SettingsTabs({ sections }: { sections: SettingsSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
      <nav className="flex gap-1 overflow-x-auto pb-1 sm:w-[180px] sm:shrink-0 sm:flex-col sm:overflow-visible sm:pb-0">
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveId(section.id)}
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
