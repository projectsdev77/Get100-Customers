"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/quests", label: "Quests" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
];

export function TopNav({
  unreadCount = 0,
  onLogout,
}: {
  unreadCount?: number;
  onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
      <Link href="/dashboard" className="text-[17px] font-semibold tracking-[-0.01em] text-primary">
        Get100-Customers
      </Link>
      <div className="flex flex-wrap items-center gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-200 ${
                active ? "bg-card text-primary" : "text-secondary hover:text-primary"
              }`}
            >
              {link.label}
              {link.label === "Notifications" && unreadCount > 0 && (
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
        <form action={onLogout}>
          <button
            type="submit"
            className="h-9 px-3.5 text-sm font-medium text-secondary transition-colors duration-200 hover:text-primary"
          >
            Log out
          </button>
        </form>
      </div>
    </nav>
  );
}
