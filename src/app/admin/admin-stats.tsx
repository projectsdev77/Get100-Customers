import { Card } from "@/components/ui/surfaces/Card";

export interface AdminStat {
  label: string;
  value: string | number;
}

// Plain stat tiles (SPEC §12 visibility gap) — no chart library needed for
// numbers this small; a sparkline/trend view can replace this once founder
// volume is actually large enough to need one.
export function AdminStats({ stats }: { stats: AdminStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium text-secondary">{stat.label}</span>
          <span className="text-2xl font-medium leading-none tracking-[-0.01em] text-primary">
            {stat.value}
          </span>
        </Card>
      ))}
    </div>
  );
}
