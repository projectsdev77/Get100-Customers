import { createAdminClient } from "@/lib/supabase/admin";
import type { Founder, Subscription, SubscriptionStatus } from "@/types/database";
import { AdminFoundersTable, type AdminFounderRow } from "./founders-table";

type FounderRow = Founder & {
  subscriptions: Pick<Subscription, "status" | "plan"> | Pick<Subscription, "status" | "plan">[] | null;
};

const STAGE_LABEL: Record<string, string> = {
  idea: "Idea",
  prototype: "Prototype",
  launched: "Launched",
};

const SUBSCRIPTION_META: Record<SubscriptionStatus | "none", { label: string; dot: string }> = {
  trialing: { label: "Trialing", dot: "bg-accent" },
  active: { label: "Active", dot: "bg-[#7BA31A]" },
  past_due: { label: "Past due", dot: "bg-[#C9A227]" },
  restricted: { label: "Restricted", dot: "bg-danger" },
  canceled: { label: "Canceled", dot: "bg-strong" },
  none: { label: "None", dot: "bg-strong" },
};

export default async function AdminFoundersPage() {
  const admin = createAdminClient();

  const [{ data: founders }, { data: userList }] = await Promise.all([
    admin
      .from("founders")
      .select("*, subscriptions(status, plan)")
      .order("created_at", { ascending: false })
      .returns<FounderRow[]>(),
    // One page covers this app's expected founder count at zero-budget
    // scale; a paid launch swap (see PHASES.md) would replace this with a
    // proper founders<->auth join once volume justifies it.
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);

  const emailById = new Map(userList?.users.map((u) => [u.id, u.email ?? "-"]) ?? []);

  const rows: AdminFounderRow[] = (founders ?? []).map((f) => {
    const sub = Array.isArray(f.subscriptions) ? f.subscriptions[0] : f.subscriptions;
    const meta = SUBSCRIPTION_META[sub?.status ?? "none"];
    return {
      id: f.id,
      company: f.company_name ?? f.name ?? "Unnamed",
      email: emailById.get(f.auth_user_id) ?? "-",
      stage: f.stage ? (STAGE_LABEL[f.stage] ?? f.stage) : "-",
      customers: f.current_customer_count,
      level: f.level,
      subscriptionLabel: meta.label,
      subscriptionDot: meta.dot,
    };
  });

  return <AdminFoundersTable rows={rows} />;
}
