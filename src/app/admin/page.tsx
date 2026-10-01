import { createAdminClient } from "@/lib/supabase/admin";
import type { Founder, Subscription, SubscriptionStatus } from "@/types/database";
import { isoDaysAgo } from "@/lib/utils/days-remaining";
import { AdminFoundersTable, type AdminFounderRow } from "./founders-table";
import { AdminStats } from "./admin-stats";

type SubFields = Pick<Subscription, "status" | "plan" | "trial_ends_at" | "grace_period_ends_at">;

type FounderRow = Founder & {
  subscriptions: SubFields | SubFields[] | null;
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

// Whole (possibly negative) days until a timestamp — daysRemaining()
// (src/lib/utils/days-remaining.ts) floors negative values to 0, which
// hides "this already lapsed" from "this is due today," a distinction
// that matters for flagging at-risk accounts here.
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

const RISK_WINDOW_DAYS = 3;

function computeRisk(sub: SubFields | null): { label: string; tone: "warn" | "danger" } | null {
  if (!sub) return null;
  if (sub.status === "trialing" && sub.trial_ends_at) {
    const days = daysUntil(sub.trial_ends_at);
    if (days < 0) return { label: "Trial expired", tone: "danger" };
    if (days <= RISK_WINDOW_DAYS) return { label: `Trial ends in ${days}d`, tone: "warn" };
  }
  if (sub.status === "past_due" && sub.grace_period_ends_at) {
    const days = daysUntil(sub.grace_period_ends_at);
    if (days >= 0) return { label: `Grace ends in ${days}d`, tone: "warn" };
  }
  return null;
}

export default async function AdminFoundersPage() {
  const admin = createAdminClient();

  const [{ data: founders }, { data: userList }] = await Promise.all([
    admin
      .from("founders")
      .select("*, subscriptions(status, plan, trial_ends_at, grace_period_ends_at)")
      .order("created_at", { ascending: false })
      .returns<FounderRow[]>(),
    // One page covers this app's expected founder count at zero-budget
    // scale; a paid launch swap (see PHASES.md) would replace this with a
    // proper founders<->auth join once volume justifies it.
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);

  const emailById = new Map(userList?.users.map((u) => [u.id, u.email ?? "-"]) ?? []);

  const allFounders = founders ?? [];
  const sevenDaysAgoIso = isoDaysAgo(7);
  const signupsLast7Days = allFounders.filter((f) => f.created_at >= sevenDaysAgoIso).length;

  const rows: AdminFounderRow[] = allFounders.map((f) => {
    const sub = Array.isArray(f.subscriptions) ? f.subscriptions[0] : f.subscriptions;
    const meta = SUBSCRIPTION_META[sub?.status ?? "none"];
    const risk = computeRisk(sub ?? null);

    return {
      id: f.id,
      company: f.company_name ?? f.name ?? "Unnamed",
      email: emailById.get(f.auth_user_id) ?? "-",
      stage: f.stage ? (STAGE_LABEL[f.stage] ?? f.stage) : "-",
      customers: f.current_customer_count,
      level: f.level,
      subscriptionStatus: sub?.status ?? "none",
      subscriptionLabel: meta.label,
      subscriptionDot: meta.dot,
      riskLabel: risk?.label,
      riskTone: risk?.tone,
    };
  });

  const activeCount = rows.filter((r) => r.subscriptionStatus === "active").length;
  const atRiskCount = rows.filter((r) => r.riskLabel).length;

  const stats = [
    { label: "Total founders", value: allFounders.length },
    { label: "Active subscriptions", value: activeCount },
    { label: "Signups (7d)", value: signupsLast7Days },
    { label: "At risk", value: atRiskCount },
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminStats stats={stats} />
      <AdminFoundersTable rows={rows} />
    </div>
  );
}
