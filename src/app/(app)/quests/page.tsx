import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { refreshQuestLog, MAX_ACTIVE_QUESTS } from "@/lib/quests/lifecycle";
import type { Quest } from "@/types/database";
import { QuestCard } from "@/components/ui/quests/QuestCard";
import { Button } from "@/components/ui/actions/Button";
import { Input } from "@/components/ui/forms/Input";
import { Banner } from "@/components/ui/surfaces/Banner";
import { ReportCard } from "./report-card";
import { InProgressCard } from "./in-progress-card";
import { QuestJournal, type JournalEntry } from "./quest-journal";
import { SkipForm, SKIP_REASON_LABELS } from "./skip-form";
import { acceptQuest, regenerateQuest, setNextFocus } from "./actions";
import { getSubscription, isRestricted } from "@/lib/subscriptions/status";

const HISTORY_STATUSES: Quest["status"][] = ["completed", "skipped", "expired"];

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

  const restricted = isRestricted(await getSubscription(supabase, founder.id));

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

  // "Show the latest status per quest ID" — a Map keyed by id keeps only
  // one row per quest even if the query ever returned more than one for
  // the same id, taking whichever is most recently resolved.
  const latestById = new Map<string, Quest>();
  for (const quest of history) {
    const existing = latestById.get(quest.id);
    if (!existing || (quest.resolved_at ?? "") > (existing.resolved_at ?? "")) {
      latestById.set(quest.id, quest);
    }
  }
  const journalEntries: JournalEntry[] = Array.from(latestById.values()).map((quest) => ({
    id: quest.id,
    title: quest.title,
    bucket: quest.status === "completed" ? "done" : "skipped",
    rightLabel:
      quest.status === "completed"
        ? `+${quest.xp_value} XP`
        : quest.status === "expired"
          ? "Expired"
          : "Skipped",
    note: quest.skip_reason
      ? (SKIP_REASON_LABELS[quest.skip_reason] ?? quest.skip_reason)
      : null,
  }));

  return (
    <div className="flex flex-col gap-3.5">
      <h1 className="text-4xl font-medium leading-[1.1] tracking-[-0.02em] text-primary">Quests</h1>

      <div className="flex flex-wrap gap-2">
        <StatusPill count={awaitingReport.length} label="needs your results" tone="input" />
        <StatusPill count={active.length} label="in progress" tone="active" />
        <StatusPill count={suggested.length} label="up next" tone="suggested" />
      </div>

      <div className="mt-5 flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 flex-1 basis-[600px] flex-col gap-9">
          {flash && active.length >= MAX_ACTIVE_QUESTS && <Banner tone="error">{flash}</Banner>}

          {awaitingReport.map((quest) => (
            <ReportCard key={quest.id} quest={quest} />
          ))}

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-secondary">
                In progress ({active.length} of {MAX_ACTIVE_QUESTS})
              </h2>
              <span className="text-[13px] text-secondary">
                Tick steps as you go. Mark done when finished.
              </span>
            </div>
            {active.length === 0 && (
              <div className="flex flex-col items-start gap-2 rounded-panel border border-dashed border-strong bg-card p-5">
                <p className="text-sm text-secondary">
                  {suggested.length > 0
                    ? "No active quest yet. Accept the one below to get started."
                    : restricted
                      ? "No active quest. Your account is restricted, so new quests are paused until you subscribe."
                      : "No active quest yet. Check back shortly for one."}
                </p>
              </div>
            )}
            {active.map((quest, i) => (
              <InProgressCard key={quest.id} quest={quest} defaultOpen={i === 0} />
            ))}
          </section>

          {!restricted && (
            <section className="flex flex-col gap-2 rounded-panel bg-card p-5">
              <h2 className="text-base font-medium text-primary">What do you want to focus on next?</h2>
              <p className="text-[13px] text-secondary">
                Tell your coach what you want to work on, and it&apos;ll shape your next quest
                around that instead of picking on its own.
              </p>
              <form action={setNextFocus} className="flex flex-wrap items-center gap-2">
                <Input
                  name="focus"
                  placeholder="e.g. cold email, or reaching out to old coworkers"
                  className="min-w-[240px] flex-1"
                />
                <Button type="submit" variant="outline" size="sm">
                  Set focus
                </Button>
              </form>
            </section>
          )}

          {(suggested.length > 0 || (active.length === 0 && awaitingReport.length === 0)) && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-secondary">Next up</h2>
              {suggested.length === 0 && (
                <div className="flex flex-col items-start gap-2 rounded-panel border border-dashed border-strong bg-card p-5">
                  <p className="text-sm text-secondary">
                    {restricted
                      ? "Your account is restricted, so new quests are paused until you subscribe."
                      : "Your coach is putting together your next quest. Check back in a moment."}
                  </p>
                </div>
              )}
              {suggested.map((quest) => (
                <QuestCard
                  key={quest.id}
                  id={`quest-${quest.id}`}
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
                      {!restricted && (
                        <form action={regenerateQuest.bind(null, quest.id)}>
                          <Button type="submit" variant="secondary" size="sm">
                            Show other options
                          </Button>
                        </form>
                      )}
                      <SkipForm questId={quest.id} />
                    </>
                  }
                />
              ))}
            </section>
          )}

          {all.length === 0 && <p className="text-sm text-secondary">No quests yet. Check back shortly.</p>}
        </div>

        {journalEntries.length > 0 && (
          <aside className="sticky top-5 min-w-0 flex-1 basis-80 [max-width:420px]">
            <QuestJournal entries={journalEntries} />
          </aside>
        )}
      </div>
    </div>
  );
}

function StatusPill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "input" | "active" | "suggested";
}) {
  const toneClasses = {
    input: "bg-quest-input text-quest-input-ink",
    active: "bg-quest-active text-quest-active-ink",
    suggested: "bg-quest-suggested text-quest-suggested-ink",
  }[tone];

  return (
    <span className={`flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium ${toneClasses}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {count} {label}
    </span>
  );
}
