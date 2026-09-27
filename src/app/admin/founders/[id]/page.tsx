import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Founder, GrowthProfile, Subscription } from "@/types/database";
import { adminCorrectCustomerCount, adminUpdateSubscriptionStatus } from "./actions";
import { Card } from "@/components/ui/surfaces/Card";
import { Input } from "@/components/ui/forms/Input";
import { Select } from "@/components/ui/forms/Select";
import { Button } from "@/components/ui/actions/Button";

export default async function AdminFounderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: founder } = await admin
    .from("founders")
    .select("*")
    .eq("id", id)
    .single<Founder>();
  if (!founder) notFound();

  const [{ data: growth }, { data: subscription }, { data: authUser }, { count: questsCompleted }] =
    await Promise.all([
      admin.from("growth_profiles").select("*").eq("founder_id", id).maybeSingle<GrowthProfile>(),
      admin.from("subscriptions").select("*").eq("founder_id", id).maybeSingle<Subscription>(),
      admin.auth.admin.getUserById(founder.auth_user_id),
      admin
        .from("quests")
        .select("id", { count: "exact", head: true })
        .eq("founder_id", id)
        .eq("status", "completed"),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
          {founder.company_name ?? founder.name ?? "Unnamed founder"}
        </h1>
        <p className="font-mono text-[13px] text-secondary">{authUser?.user?.email}</p>
      </div>

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
      </Card>
    </div>
  );
}
