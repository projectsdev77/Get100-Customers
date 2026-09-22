import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Founder, Subscription } from "@/types/database";

type FounderRow = Founder & {
  subscriptions: Pick<Subscription, "status" | "plan"> | Pick<Subscription, "status" | "plan">[] | null;
};

export default async function AdminFoundersPage() {
  const admin = createAdminClient();

  const { data: founders } = await admin
    .from("founders")
    .select("*, subscriptions(status, plan)")
    .order("created_at", { ascending: false })
    .returns<FounderRow[]>();

  const rows = founders ?? [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Founders</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{rows.length} total</p>

      <div className="overflow-x-auto rounded border border-zinc-300 dark:border-zinc-700">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2">Customers</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Subscription</th>
              <th className="px-3 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => {
              const sub = Array.isArray(f.subscriptions) ? f.subscriptions[0] : f.subscriptions;
              return (
                <tr key={f.id} className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
                  <td className="px-3 py-2">
                    <Link href={`/admin/founders/${f.id}`} className="text-black underline dark:text-zinc-50">
                      {f.company_name ?? f.name ?? "Unnamed"}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{f.stage ?? "—"}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {f.current_customer_count}/100
                  </td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{f.level}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {sub?.status ?? "none"}
                  </td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
