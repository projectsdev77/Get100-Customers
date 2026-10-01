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
// that matters for flagging at-risk accounts here. Uses Math.floor, not
// Math.ceil: ceil(-0.02) is -0, and -0 < 0 is false in JS, so a timestamp
// that passed less than a day ago would silently fail the "already
// expired" check below and show "ends in 0d" instead — floor never
// produces -0 for a genuinely negative input, so "expired one minute ago"
// floors straight to -1, not 0.
function daysUntil(iso: string): number {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

const RISK_WINDOW_DAYS = 3;

// Extracted alongside daysUntil for the same reason — see its comment.
function isCurrentlyBanned(bannedUntil: string | null | undefined): boolean {
  return Boolean(bannedUntil && new Date(bannedUntil).getTime() > Date.now());
}

function computeRisk(sub: SubFields | null): { label: string; tone: "warn" | "danger" } | null {
  if (!sub) return null;
  if (sub.status === "trialing" && sub.trial_ends_at) {
    const days = daysUntil(sub.trial_ends_at);
    if (days < 0) return { label: "Trial expired", tone: "danger" };
    if (days <= RISK_WINDOW_DAYS) return { label: `Trial ends in ${days}d`, tone: "warn" };
  }
  if (sub.status === "past_due" && sub.grace_period_ends_at) {
    const days = daysUntil(sub.grace_period_ends_at);
    // Grace period already lapsed but applySubscriptionLifecycle's lazy
    // check hasn't run yet to flip status to "restricted" (it only runs
    // when the founder next loads a page) — same lapsed-but-not-yet-
    // transitioned gap the trialing branch above already accounts for.
    if (days < 0) return { label: "Grace expired", tone: "danger" };
    return { label: `Grace ends in ${days}d`, tone: "warn" };
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

  const authById = new Map(
    userList?.users.map((u) => [u.id, { email: u.email ?? "-", bannedUntil: u.banned_until }]) ?? [],
  );

  const allFounders = founders ?? [];
  const sevenDaysAgoIso = isoDaysAgo(7);
  const signupsLast7Days = allFounders.filter((f) => f.created_at >= sevenDaysAgoIso).length;

  const rows: AdminFounderRow[] = allFounders.map((f) => {
    const sub = Array.isArray(f.subscriptions) ? f.subscriptions[0] : f.subscriptions;
    const meta = SUBSCRIPTION_META[sub?.status ?? "none"];
    const risk = computeRisk(sub ?? null);
    const auth = authById.get(f.auth_user_id);
    const suspended = isCurrentlyBanned(auth?.bannedUntil);

    return {
      id: f.id,
      company: f.company_name ?? f.name ?? "Unnamed",
      email: auth?.email ?? "-",
      stage: f.stage ? (STAGE_LABEL[f.stage] ?? f.stage) : "-",
      customers: f.current_customer_count,
      level: f.level,
      subscriptionStatus: sub?.status ?? "none",
      subscriptionLabel: meta.label,
      subscriptionDot: meta.dot,
      riskLabel: risk?.label,
      riskTone: risk?.tone,
      suspended,
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
