"use client";

import { useState } from "react";
import { Table, type TableColumn } from "@/components/ui/data/Table";

export interface AdminFounderRow {
  id: string;
  company: string;
  email: string;
  stage: string;
  customers: number;
  level: number;
  subscriptionLabel: string;
  subscriptionDot: string;
}

const COLUMNS: TableColumn<AdminFounderRow>[] = [
  { key: "company", label: "Company", width: "1.4fr" },
  { key: "email", label: "Email", width: "1.6fr", mono: true },
  { key: "stage", label: "Stage", width: "1fr" },
  { key: "customers", label: "Customers", align: "right", width: "0.8fr" },
  { key: "level", label: "Level", align: "right", width: "0.6fr" },
  {
    key: "subscriptionLabel",
    label: "Subscription",
    width: "1fr",
    render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
        <span className={`h-1.5 w-1.5 rounded-full ${row.subscriptionDot}`} />
        {row.subscriptionLabel}
      </span>
    ),
  },
];

export function AdminFoundersTable({ rows }: { rows: AdminFounderRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? rows.filter((r) =>
        `${r.company}${r.email}`.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
            Founders
          </h1>
          <span className="text-sm text-secondary">
            {filtered.length} founder{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
        <input
          type="text"
          placeholder="Search company or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-[280px] max-w-full rounded-full border border-strong bg-card px-4 text-sm text-primary outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-secondary focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </div>

      <Table columns={COLUMNS} rows={filtered} getHref={(row) => `/admin/founders/${row.id}`} />
    </div>
  );
}
