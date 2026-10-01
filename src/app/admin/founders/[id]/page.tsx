import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Founder, GrowthProfile, NotificationLogEntry, Subscription } from "@/types/database";
import {
  adminCorrectCustomerCount,
  adminGenerateQuest,
  adminSendMessage,
  adminSuspendAccount,
  adminUnsuspendAccount,
  adminUpdateSubscriptionStatus,
} from "./actions";
import { Card } from "@/components/ui/surfaces/Card";
import { Input } from "@/components/ui/forms/Input";
import { Select } from "@/components/ui/forms/Select";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Button } from "@/components/ui/actions/Button";
import { Banner } from "@/components/ui/surfaces/Banner";

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  new_quest: "New quest",
  window_approaching: "Quest due soon",
  re_engagement: "Re-engagement",
  milestone: "Milestone",
  weekly_recap: "Weekly recap",
  quest_check_in: "Quest check-in",
  admin_message: "Message from support",
};

const NOTIFICATION_HISTORY_LIMIT = 20;

export default async function AdminFounderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flash?: string }>;
}) {
  const { id } = await params;
  const { flash } = await searchParams;
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
      .limit(NOTIFICATION_HISTORY_LIMIT)
      .returns<NotificationLogEntry[]>(),
  ]);

  // banned_until is set via Supabase's own Admin API ban (adminSuspendAccount/
  // adminUnsuspendAccount), not a custom column — checked against the
  // current time since a ban with a finite duration could in principle
  // have already lapsed, even though this app only ever sets the ~100-year
  // "permanent" one or clears it back to none.
  const bannedUntil = authUser?.user?.banned_until;
  const isSuspended = Boolean(bannedUntil && new Date(bannedUntil) > new Date());

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
            <dd className="font-mono text-[13px] text-primary">
              {JSON.stringify(growth.what_working)}
            </dd>
            <dt className="text-secondary">What&apos;s not working</dt>
            <dd className="font-mono text-[13px] text-primary">
              {JSON.stringify(growth.what_not_working)}
            </dd>
          </dl>
        ) : (
          <p className="text-sm text-secondary">No growth profile yet.</p>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="text-base font-medium text-primary">
          Notification history (last {NOTIFICATION_HISTORY_LIMIT})
        </h2>
        {/*
          Answers "did they actually get that email" without needing to
          dig through Resend/Vercel logs for every support question — this
          only confirms a send was attempted and logged (notify.ts), not
          that Resend actually delivered it; the email row's `message` is
          its subject line, not the full body, since only the subject is
          persisted (src/lib/notifications/notify.ts).
        */}
        {notifications && notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.map((n, i) => (
              <div
                key={n.id}
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm ${
                  i > 0 ? "border-t border-subtle" : ""
                }`}
              >
                <span className="w-[108px] shrink-0 font-mono text-[12px] text-secondary">
                  {new Date(n.sent_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="w-20 shrink-0 text-[12px] font-medium uppercase tracking-[0.04em] text-secondary">
                  {n.channel === "email" ? "Email" : "In-app"}
                </span>
                <span className="min-w-[140px] shrink-0 text-primary">
                  {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
                </span>
                <span className="min-w-0 flex-1 truncate text-secondary">{n.message}</span>
                {n.channel === "in_app" && (
                  <span className="shrink-0 text-[12px] text-secondary">
                    {n.read_at ? "Read" : "Unread"}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">No notifications logged yet.</p>
        )}
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-base font-medium text-primary">Support overrides</h2>

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

        <form action={adminUpdateSubscriptionStatus} className="flex flex-wrap items-end gap-2">
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

        <form action={adminGenerateQuest} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="founderId" value={founder.id} />
          <Button type="submit" variant="secondary" size="sm">
            Generate a quest now
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="text-base font-medium text-primary">Send a message</h2>
        <p className="text-[13px] text-secondary">
          Shown in their in-app notifications regardless of their email preferences, since this is
          a direct message, not an automated category they opted in/out of.
        </p>
        <form action={adminSendMessage} className="flex flex-col gap-3">
          <input type="hidden" name="founderId" value={founder.id} />
          <Textarea name="message" placeholder="What do you want to tell them?" rows={3} required />
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" name="sendEmail" className="h-4 w-4" />
            Also send as an email
          </label>
          <Button type="submit" variant="secondary" size="sm" className="self-start">
            Send
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3.5 rounded-panel border border-banner-error-border bg-card p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-danger">
            {isSuspended ? "Account suspended" : "Suspend account"}
          </h2>
          <p className="text-sm text-secondary">
            {isSuspended
              ? "This account can't sign in anywhere (password, Google) until unsuspended."
              : "Blocks sign-in everywhere (password, Google) immediately. For abuse or a chargeback — not for billing issues, which the subscription status above already handles."}
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
    </div>
  );
}
