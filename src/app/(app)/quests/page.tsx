import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { refreshQuestLog } from "@/lib/quests/lifecycle";
import type { Quest } from "@/types/database";
import { acceptQuest, markQuestDone, regenerateQuest, skipQuest } from "./actions";

const STATUS_LABEL: Record<Quest["status"], string> = {
  suggested: "Suggested",
  active: "Active",
  in_progress: "In progress",
  awaiting_report: "Awaiting report",
  completed: "Completed",
  skipped: "Skipped",
  expired: "Expired",
};

const HISTORY_STATUSES: Quest["status"][] = ["completed", "skipped", "expired"];

export default async function QuestsPage() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) redirect("/login");
  if (!founder.industry || !founder.product_description) redirect("/onboarding");

  await refreshQuestLog(supabase, founder);

  const { data: quests } = await supabase
    .from("quests")
    .select("*")
    .eq("founder_id", founder.id)
    .order("created_at", { ascending: false })
    .returns<Quest[]>();

  const all = quests ?? [];
  const suggested = all.filter((q) => q.status === "suggested");
  const active = all.filter((q) => q.status === "active" || q.status === "in_progress");
  const awaitingReport = all.filter((q) => q.status === "awaiting_report");
  const history = all.filter((q) => HISTORY_STATUSES.includes(q.status));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Quests</h1>

      {suggested.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Next up
          </h2>
          {suggested.map((quest) => (
            <div
              key={quest.id}
              className="rounded border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <p className="font-medium text-black dark:text-zinc-50">{quest.title}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {quest.instructions}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                +{quest.xp_value} XP · {quest.suggested_window}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={acceptQuest.bind(null, quest.id)}>
                  <button
                    type="submit"
                    className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-zinc-50 dark:text-black"
                  >
                    Accept
                  </button>
                </form>
                <form action={regenerateQuest.bind(null, quest.id)}>
                  <button
                    type="submit"
                    className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
                  >
                    Show other options
                  </button>
                </form>
                <SkipForm questId={quest.id} />
              </div>
            </div>
          ))}
        </section>
      )}

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Active
          </h2>
          {active.map((quest) => (
            <div
              key={quest.id}
              className="rounded border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <p className="font-medium text-black dark:text-zinc-50">{quest.title}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {quest.instructions}
              </p>
              {quest.tools_provided.length > 0 && (
                <div className="mt-2 rounded bg-zinc-50 p-2 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                  <p className="font-medium">{quest.tools_provided[0].label}</p>
                  <p className="whitespace-pre-wrap">{quest.tools_provided[0].content}</p>
                </div>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                +{quest.xp_value} XP · {quest.suggested_window}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={markQuestDone.bind(null, quest.id)}>
                  <button
                    type="submit"
                    className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-zinc-50 dark:text-black"
                  >
                    Mark done
                  </button>
                </form>
                <SkipForm questId={quest.id} />
              </div>
            </div>
          ))}
        </section>
      )}

      {awaitingReport.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Awaiting report
          </h2>
          {awaitingReport.map((quest) => (
            <div
              key={quest.id}
              className="rounded border border-zinc-300 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {quest.title} — result logging lands in the next build phase.
            </div>
          ))}
        </section>
      )}

      {history.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Quest journal
          </h2>
          {history.map((quest) => (
            <div
              key={quest.id}
              className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span className="text-zinc-700 dark:text-zinc-300">{quest.title}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {STATUS_LABEL[quest.status]}
                {quest.skip_reason ? ` — ${quest.skip_reason}` : ""}
              </span>
            </div>
          ))}
        </section>
      )}

      {all.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No quests yet — check back shortly.
        </p>
      )}
    </div>
  );
}

function SkipForm({ questId }: { questId: string }) {
  return (
    <form action={skipQuest} className="flex items-center gap-2">
      <input type="hidden" name="questId" value={questId} />
      <select
        name="reason"
        className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        defaultValue=""
      >
        <option value="">Not for me…</option>
        <option value="too_hard">Too hard</option>
        <option value="not_relevant">Not relevant</option>
        <option value="already_tried">Already tried</option>
        <option value="no_time">No time</option>
      </select>
      <button
        type="submit"
        className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
      >
        Skip
      </button>
    </form>
  );
}
