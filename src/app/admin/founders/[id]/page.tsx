import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Founder, GrowthProfile, Subscription } from "@/types/database";
import { adminCorrectCustomerCount, adminUpdateSubscriptionStatus } from "./actions";

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
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {founder.company_name ?? founder.name ?? "Unnamed founder"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{authUser?.user?.email}</p>
      </div>

      <section className="rounded border border-zinc-300 bg-white p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-2 font-medium text-black dark:text-zinc-50">Profile</h2>
        <dl className="grid grid-cols-2 gap-2 text-zinc-700 dark:text-zinc-300">
          <dt className="text-zinc-500 dark:text-zinc-400">Industry</dt>
          <dd>{founder.industry ?? "—"}</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Stage</dt>
          <dd>{founder.stage ?? "—"}</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">ICP</dt>
          <dd>{founder.icp ?? "—"}</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Product</dt>
          <dd>{founder.product_description ?? "—"}</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Level / XP</dt>
          <dd>
            {founder.level} / {founder.xp} XP
          </dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Streak</dt>
          <dd>{founder.streak_count} days</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Quests completed</dt>
          <dd>{questsCompleted ?? 0}</dd>
        </dl>
      </section>

      <section className="rounded border border-zinc-300 bg-white p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-2 font-medium text-black dark:text-zinc-50">
          Growth profile (read-only)
        </h2>
        {growth ? (
          <dl className="flex flex-col gap-2 text-zinc-700 dark:text-zinc-300">
            <dt className="text-zinc-500 dark:text-zinc-400">Bottleneck hypothesis</dt>
            <dd>{growth.bottleneck_hypothesis ?? "—"}</dd>
            <dt className="text-zinc-500 dark:text-zinc-400">What&apos;s working</dt>
            <dd>{JSON.stringify(growth.what_working)}</dd>
            <dt className="text-zinc-500 dark:text-zinc-400">What&apos;s not working</dt>
            <dd>{JSON.stringify(growth.what_not_working)}</dd>
          </dl>
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400">No growth profile yet.</p>
        )}
      </section>

      <section className="rounded border border-zinc-300 bg-white p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium text-black dark:text-zinc-50">Support overrides</h2>

        <form action={adminCorrectCustomerCount} className="mb-4 flex items-center gap-2">
          <input type="hidden" name="founderId" value={founder.id} />
          <label className="text-zinc-600 dark:text-zinc-400">Customer count:</label>
          <input
            type="number"
            name="count"
            min={0}
            defaultValue={founder.current_customer_count}
            className="w-20 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
          >
            Save
          </button>
        </form>

        <form action={adminUpdateSubscriptionStatus} className="flex items-center gap-2">
          <input type="hidden" name="founderId" value={founder.id} />
          <label className="text-zinc-600 dark:text-zinc-400">Subscription status:</label>
          <select
            name="status"
            defaultValue={subscription?.status ?? "trialing"}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="trialing">trialing</option>
            <option value="active">active</option>
            <option value="past_due">past_due</option>
            <option value="restricted">restricted</option>
            <option value="canceled">canceled</option>
          </select>
          <button
            type="submit"
            className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
          >
            Save
          </button>
        </form>
      </section>
    </div>
  );
}
