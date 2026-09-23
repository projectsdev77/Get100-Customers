import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { refreshQuestLog, MAX_ACTIVE_QUESTS } from "@/lib/quests/lifecycle";
import type { Quest } from "@/types/database";
import { QuestCard, JournalRow } from "@/components/ui/quests/QuestCard";
import { Button } from "@/components/ui/actions/Button";
import { Select } from "@/components/ui/forms/Select";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Input } from "@/components/ui/forms/Input";
import { Banner } from "@/components/ui/surfaces/Banner";
import {
  acceptQuest,
  markQuestDone,
  regenerateQuest,
  skipQuest,
  submitQuestResult,
} from "./actions";

const HISTORY_STATUSES: Quest["status"][] = ["completed", "skipped", "expired"];

const SKIP_REASONS = [
  { value: "too_hard", label: "Too hard" },
  { value: "not_relevant", label: "Not relevant" },
  { value: "already_tried", label: "Already tried" },
  { value: "no_time", label: "No time" },
];

export default async function QuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const { flash } = await searchParams;
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
      <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">
        Quests
      </h1>

      {flash && <Banner tone="error">{flash}</Banner>}

      {awaitingReport.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[.06em] text-secondary">
            Report your results
          </h2>
          {awaitingReport.map((quest) => (
            <form key={quest.id} action={submitQuestResult}>
              <input type="hidden" name="questId" value={quest.id} />
              <QuestCard
                status="awaiting_report"
                title={quest.title}
                xp={quest.xp_value}
                reasoning={quest.reasoning}
                actions={
                  <Button type="submit" size="sm">
                    Submit report
                  </Button>
                }
              >
                <div className="flex flex-col gap-3">
                  {quest.result_questions.map((q) =>
                    q.type === "boolean" ? (
                      <Select
                        key={q.id}
                        name={`answer_${q.id}`}
                        label={q.prompt}
                        defaultValue="false"
                        options={[
                          { value: "true", label: "Yes" },
                          { value: "false", label: "No" },
                        ]}
                      />
                    ) : q.type === "number" ? (
                      <Input
                        key={q.id}
                        type="number"
                        name={`answer_${q.id}`}
                        label={q.prompt}
                        min={0}
                        defaultValue={0}
                      />
                    ) : (
                      <Input key={q.id} type="text" name={`answer_${q.id}`} label={q.prompt} />
                    ),
                  )}
                  <Textarea name="notes" label="Anything else worth noting?" rows={2} />
                </div>
              </QuestCard>
            </form>
          ))}
        </section>
      )}

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[.06em] text-secondary">
            Active ({active.length} of {MAX_ACTIVE_QUESTS})
          </h2>
          {active.map((quest) => (
            <QuestCard
              key={quest.id}
              status={quest.status}
              title={quest.title}
              instructions={quest.instructions}
              xp={quest.xp_value}
              window={quest.suggested_window}
              tool={quest.tools_provided[0] ?? null}
              reasoning={quest.reasoning}
              actions={
                <>
                  <form action={markQuestDone.bind(null, quest.id)}>
                    <Button type="submit" size="sm">
                      Mark done
                    </Button>
                  </form>
                  <SkipForm questId={quest.id} />
                </>
              }
            />
          ))}
        </section>
      )}

      {suggested.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[.06em] text-secondary">
            Next up
          </h2>
          {suggested.map((quest) => (
            <QuestCard
              key={quest.id}
              status="suggested"
              title={quest.title}
              instructions={quest.instructions}
              xp={quest.xp_value}
              window={quest.suggested_window}
              reasoning={quest.reasoning}
              actions={
                <>
                  <form action={acceptQuest.bind(null, quest.id)}>
                    <Button type="submit" size="sm">
                      Accept
                    </Button>
                  </form>
                  <form action={regenerateQuest.bind(null, quest.id)}>
                    <Button type="submit" variant="secondary" size="sm">
                      Show other options
                    </Button>
                  </form>
                  <SkipForm questId={quest.id} />
                </>
              }
            />
          ))}
        </section>
      )}

      {history.length > 0 && (
        <section className="flex flex-col gap-1 rounded-panel bg-card px-4 py-2">
          <h2 className="pt-2 text-[13px] font-medium uppercase tracking-[.06em] text-secondary">
            Quest journal
          </h2>
          {history.map((quest) => (
            <JournalRow
              key={quest.id}
              status={quest.status}
              title={quest.title}
              xp={quest.status === "completed" ? quest.xp_value : null}
              note={quest.skip_reason}
            />
          ))}
        </section>
      )}

      {all.length === 0 && <p className="text-sm text-secondary">No quests yet — check back shortly.</p>}
    </div>
  );
}

function SkipForm({ questId }: { questId: string }) {
  return (
    <form action={skipQuest} className="flex items-center gap-2">
      <input type="hidden" name="questId" value={questId} />
      <Select name="reason" placeholder="Not for me…" options={SKIP_REASONS} className="w-40" />
      <Button type="submit" variant="secondary" size="sm">
        Skip
      </Button>
    </form>
  );
}
