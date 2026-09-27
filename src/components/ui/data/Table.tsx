import type { ReactNode } from "react";
import Link from "next/link";

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  mono?: boolean;
  width?: string;
  render?: (row: T) => ReactNode;
}

// Reference: design-system/components/data/Table.jsx, reimplemented as a
// CSS grid (so a row can be a single <Link>, matching how the admin list
// links each founder to their detail page) instead of an HTML <table>.
export function Table<T extends { id: string }>({
  columns,
  rows,
  getHref,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  getHref?: (row: T) => string;
}) {
  const gridCols = columns.map((c) => c.width ?? "minmax(0,1fr)").join(" ");

  return (
    <div className="overflow-x-auto rounded-panel bg-card">
      <div style={{ minWidth: 640 }}>
        <div
          className="grid gap-3 border-b border-subtle px-5 py-3.5"
          style={{ gridTemplateColumns: gridCols }}
        >
          {columns.map((c) => (
            <span
              key={c.key}
              className={`text-xs font-medium text-secondary ${c.align === "right" ? "text-right" : ""}`}
            >
              {c.label}
            </span>
          ))}
        </div>
        {rows.map((row, i) => {
          const cells = columns.map((c) => (
            <span
              key={c.key}
              className={`min-w-0 truncate text-sm text-primary ${c.mono ? "font-mono text-[13px]" : ""} ${
                c.align === "right" ? "text-right" : ""
              }`}
            >
              {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
            </span>
          ));
          const rowClass = `grid items-center gap-3 px-5 py-3 ${i > 0 ? "border-t border-subtle" : ""}`;

          return getHref ? (
            <Link
              key={row.id}
              href={getHref(row)}
              className={`${rowClass} hover:bg-sunken`}
              style={{ gridTemplateColumns: gridCols }}
            >
              {cells}
            </Link>
          ) : (
            <div key={row.id} className={rowClass} style={{ gridTemplateColumns: gridCols }}>
              {cells}
            </div>
          );
        })}
      </div>
    </div>
  );
}
