import { Button } from "@/components/ui/actions/Button";
import { Input } from "@/components/ui/forms/Input";
import { Select } from "@/components/ui/forms/Select";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Tabs, type TabSection } from "@/components/ui/navigation/Tabs";
import { Banner } from "@/components/ui/surfaces/Banner";
import { Card } from "@/components/ui/surfaces/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Founder, GrowthProfile, NotificationLogEntry, Subscription } from "@/types/database";
import { notFound } from "next/navigation";
import {
  adminCorrectCustomerCount,
  adminGenerateQuest,
  adminSendMessage,
  adminSuspendAccount,
  adminUnsuspendAccount,
  adminUpdateSubscriptionStatus,
} from "./actions";
import { NotificationHistory } from "./notification-history";

// Raised from 20 so NotificationHistory's "emails & messages only" default
// filter still has enough of a pool to find something in on an account
// with a lot of routine quest-generation noise — this is a fetch cap, not
// how many rows get shown at once (see notification-history.tsx).
const NOTIFICATION_FETCH_LIMIT = 50;

// Was rendering JSON.stringify(growth.what_working) directly — showed a
// bare "[]" with no explanation when empty, and raw
// {"insight":"...","evidence":"..."} objects even when it had data.
function GrowthInsightList({
  insights,
  emptyText,
}: {
  insights: Array<{ insight: string; evidence?: string }>;
  emptyText: string;
}) {
  if (insights.length === 0) {
    return <p className="text-primary">{emptyText}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {insights.map((item, i) => (
        <li key={i} className="text-primary">
          {item.insight}
          {item.evidence && (
            <span className="block text-[13px] text-secondary">{item.evidence}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function AdminFounderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flash?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { flash, tab } = await searchParams;
  const admin = createAdminClient();

  const { data: founder } = await admin
    .from("founders")
    .select("*")
    .eq("id", id)
    .single<Founder>();
  if (!founder) notFound();

  const [
    { data: growth },
    { data: subscription },
    { data: authUser },
    { count: questsCompleted },
    { data: notifications },
  ] = await Promise.all([
    admin.from("growth_profiles").select("*").eq("founder_id", id).maybeSingle<GrowthProfile>(),
    admin.from("subscriptions").select("*").eq("founder_id", id).maybeSingle<Subscription>(),
    admin.auth.admin.getUserById(founder.auth_user_id),
    admin
      .from("quests")
      .select("id", { count: "exact", head: true })
      .eq("founder_id", id)
      .eq("status", "completed"),
    admin
      .from("notifications_log")
      .select("*")
      .eq("founder_id", id)
      .order("sent_at", { ascending: false })
      .limit(NOTIFICATION_FETCH_LIMIT)
      .returns<NotificationLogEntry[]>(),
  ]);

  // banned_until is set via Supabase's own Admin API ban (adminSuspendAccount/
  // adminUnsuspendAccount), not a custom column — checked against the
  // current time since a ban with a finite duration could in principle
  // have already lapsed, even though this app only ever sets the ~100-year
  // "permanent" one or clears it back to none.
  const bannedUntil = authUser?.user?.banned_until;
  const isSuspended = Boolean(bannedUntil && new Date(bannedUntil) > new Date());

  const sections: TabSection[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="text-base font-medium text-primary">Profile</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-secondary">Industry</dt>
              <dd className="text-primary">{founder.industry ?? "-"}</dd>
              <dt className="text-secondary">Stage</dt>
              <dd className="text-primary">{founder.stage ?? "-"}</dd>
              <dt className="text-secondary">ICP</dt>
              <dd className="text-primary">{founder.icp ?? "-"}</dd>
              <dt className="text-secondary">Product</dt>
              <dd className="text-primary">{founder.product_description ?? "-"}</dd>
              <dt className="text-secondary">Level / XP</dt>
              <dd className="font-mono text-primary">
                {founder.level} / {founder.xp} XP
              </dd>
              <dt className="text-secondary">Streak</dt>
              <dd className="font-mono text-primary">{founder.streak_count} days</dd>
              <dt className="text-secondary">Quests completed</dt>
              <dd className="font-mono text-primary">{questsCompleted ?? 0}</dd>
            </dl>
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <h2 className="text-base font-medium text-primary">Growth profile (read-only)</h2>
            {growth ? (
              <dl className="flex flex-col gap-3 text-sm">
                <dt className="text-secondary">Bottleneck hypothesis</dt>
                <dd className="text-primary">{growth.bottleneck_hypothesis ?? "-"}</dd>
                <dt className="text-secondary">What&apos;s working</dt>
                <dd>
                  <GrowthInsightList
                    insights={growth.what_working}
                    emptyText="Nothing yet — no channel has a confirmed conversion."
                  />
                </dd>
                <dt className="text-secondary">What&apos;s not working</dt>
                <dd>
                  <GrowthInsightList
                    insights={growth.what_not_working}
                    emptyText="Nothing yet — no channel has been tried enough times without converting to call it out."
                  />
                </dd>
              </dl>
            ) : (
              <p className="text-sm text-secondary">No growth profile yet.</p>
            )}
          </Card>
        </div>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      content: (
        <Card className="flex flex-col gap-3 p-6">
          <h2 className="text-base font-medium text-primary">Notification history</h2>
          <NotificationHistory entries={notifications ?? []} />
        </Card>
      ),
    },
    {
      id: "actions",
      label: "Support actions",
      content: (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="text-base font-medium text-primary">Support overrides</h2>

            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-secondary">
                Corrects a miscounted total.
              </p>
              <form action={adminCorrectCustomerCount} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="founderId" value={founder.id} />
                <Input
                  label="Customer count"
                  type="number"
                  name="count"
                  min={0}
                  defaultValue={founder.current_customer_count}
                  className="w-32"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Save
                </Button>
              </form>
            </div>

            <div className="flex flex-col gap-2 border-t border-subtle pt-4">
              <p className="text-[13px] text-secondary">
                Manually sets billing state.
              </p>
              <form
                action={adminUpdateSubscriptionStatus}
                className="flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="founderId" value={founder.id} />
                <Select
                  label="Subscription status"
                  name="status"
                  defaultValue={subscription?.status ?? "trialing"}
                  options={["trialing", "active", "past_due", "restricted", "canceled"]}
                  className="w-40"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Save
                </Button>
              </form>
            </div>

            <div className="flex flex-col gap-2 border-t border-subtle pt-4">
              <div>
                <h3 className="text-sm font-medium text-primary">Generate a quest now</h3>
                <p className="text-[13px] text-secondary">
                  For when a founder is stuck with no quest waiting.
                </p>
              </div>
              <form action={adminGenerateQuest}>
                <input type="hidden" name="founderId" value={founder.id} />
                <Button type="submit" variant="secondary" size="sm">
                  Generate a quest now
                </Button>
              </form>
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <h2 className="text-base font-medium text-primary">Send a message</h2>
            <p className="text-[13px] text-secondary">
              Shown in their in-app notifications regardless of their email preferences, since this
              is a direct message, not an automated category they opted in/out of.
            </p>
            <form action={adminSendMessage} className="flex flex-col gap-3">
              <input type="hidden" name="founderId" value={founder.id} />
              <Textarea
                name="message"
                placeholder="What do you want to tell them?"
                rows={3}
                required
              />
              <label className="flex items-center gap-2 text-sm text-secondary">
                <input type="checkbox" name="sendEmail" className="h-4 w-4" />
                Also send as an email
              </label>
              <Button type="submit" variant="secondary" size="sm" className="self-start">
                Send
              </Button>
            </form>
          </Card>
        </div>
      ),
    },
    {
      id: "suspend",
      label: "Suspend",
      content: (
        <div className="flex flex-col gap-3.5 rounded-panel border border-banner-error-border bg-card p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-medium text-danger">
              {isSuspended ? "Account suspended" : "Suspend account"}
            </h2>
            <p className="text-sm text-secondary">
              {isSuspended
                ? "This account can't sign in anywhere (password, Google) until unsuspended."
                : "Blocks sign-in everywhere (password, Google) immediately. For abuse or a chargeback — not for billing issues, which the subscription status override already handles."}
            </p>
          </div>
          <form
            action={isSuspended ? adminUnsuspendAccount : adminSuspendAccount}
            className="self-start"
          >
            <input type="hidden" name="founderId" value={founder.id} />
            <Button type="submit" variant={isSuspended ? "secondary" : "danger"} size="sm">
              {isSuspended ? "Unsuspend account" : "Suspend account"}
            </Button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
            {founder.company_name ?? founder.name ?? "Unnamed founder"}
          </h1>
          {isSuspended && (
            <span className="inline-flex h-6 items-center rounded-full bg-danger px-2.5 text-xs font-medium text-white">
              Suspended
            </span>
          )}
        </div>
        <p className="font-mono text-[13px] text-secondary">{authUser?.user?.email}</p>
      </div>

      {flash && <Banner tone="info">{flash}</Banner>}

      <Tabs sections={sections} initialTabId={tab} contentWidthClassName="max-w-none" />
    </div>
  );
}
