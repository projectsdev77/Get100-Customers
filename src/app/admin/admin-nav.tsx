"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Founders", isActive: (p: string) => p === "/admin" || p.startsWith("/admin/founders") },
  { href: "/admin/coaches", label: "Coaches", isActive: (p: string) => p.startsWith("/admin/coaches") },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-200 ${
            link.isActive(pathname) ? "bg-card text-primary" : "text-secondary hover:text-primary"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
