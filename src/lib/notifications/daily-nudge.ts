import { Type } from "@google/genai";
import { GEMINI_MODELS } from "@/lib/ai/gemini";
import { generateStructuredContent } from "@/lib/ai/generate-structured";
import { getQuestSteps } from "@/lib/quests/steps";
import type { Quest } from "@/types/database";

export const NUDGE_WINDOW_HOURS = 24;
// Shorter than the cron interval, so yesterday's run at 13:00:40 doesn't
// block today's at 13:00:10 and make the nudge skip every other day.
const NUDGE_DEDUPE_HOURS = 20;

export type NudgeQuest = Pick<
  Quest,
  "id" | "founder_id" | "title" | "sub_tasks" | "instructions" | "expires_at" | "activated_at" | "last_progress_at"
>;

export interface NudgeSignals {
  // Founders with any progress in the window: a logged customer, a quest
  // report, a completed quest, or a ticked step.
  recentlyProgressed: Set<string>;
  restricted: Set<string>;
  // Recent notifications, so a founder never gets two nudges in a day.
  recentNotifications: Array<{ founder_id: string; type: string; sent_at: string }>;
}

function hoursAgo(iso: string | null, now: number): number {
  return iso ? (now - new Date(iso).getTime()) / 3_600_000 : Infinity;
}

// Picks one quest per founder to nudge about (the one due soonest), and
// drops anyone who made progress, just accepted a quest, can't act on it
// (restricted), or was already nudged today by this or another job.
export function selectNudges(quests: NudgeQuest[], signals: NudgeSignals, now = Date.now()): NudgeQuest[] {
  const recentlyNotified = new Set(
    signals.recentNotifications
      .filter((n) => {
        const age = hoursAgo(n.sent_at, now);
        return n.type === "daily_nudge" ? age < NUDGE_DEDUPE_HOURS : age < NUDGE_WINDOW_HOURS;
      })
      .map((n) => n.founder_id),
  );

  const byFounder = new Map<string, NudgeQuest[]>();
  for (const quest of quests) {
    byFounder.set(quest.founder_id, [...(byFounder.get(quest.founder_id) ?? []), quest]);
  }

  const picked: NudgeQuest[] = [];
  for (const [founderId, founderQuests] of byFounder) {
    if (signals.recentlyProgressed.has(founderId)) continue;
    if (signals.restricted.has(founderId)) continue;
    if (recentlyNotified.has(founderId)) continue;
    const touchedRecently = founderQuests.some(
      (q) =>
        hoursAgo(q.activated_at, now) < NUDGE_WINDOW_HOURS || hoursAgo(q.last_progress_at, now) < NUDGE_WINDOW_HOURS,
    );
    if (touchedRecently) continue;

    const dueSoonest = [...founderQuests].sort(
      (a, b) =>
        (a.expires_at ? new Date(a.expires_at).getTime() : Infinity) -
        (b.expires_at ? new Date(b.expires_at).getTime() : Infinity),
    )[0];
    picked.push(dueSoonest);
  }
  return picked;
}

export interface NudgeContext {
  firstName: string | null;
  company: string | null;
  questTitle: string;
  nextStep: string | null;
  daysLeft: number | null;
  customers: number;
}

export function buildNudgeContext(
  quest: NudgeQuest,
  founder: { name: string | null; company_name: string | null; current_customer_count: number },
  now = Date.now(),
): NudgeContext {
  const nextStep = getQuestSteps(quest).find((s) => !s.done)?.label ?? null;
  return {
    firstName: founder.name?.trim().split(/\s+/)[0] || null,
    company: founder.company_name,
    questTitle: quest.title,
    nextStep,
    daysLeft: quest.expires_at ? Math.max(0, Math.ceil((new Date(quest.expires_at).getTime() - now) / 86_400_000)) : null,
    customers: founder.current_customer_count,
  };
}

export interface NudgeCopy {
  subject: string;
  body: string;
}

const MAX_SUBJECT = 80;
const MAX_BODY = 420;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    body: { type: Type.STRING },
  },
  required: ["subject", "body"],
};

// Rejects anything we wouldn't want landing in an inbox unreviewed: empty
// or overlong text, leftover {{placeholders}} or [brackets], links (the
// email adds its own button), or line breaks in the subject.
export function isUsableNudge(copy: Partial<NudgeCopy> | null | undefined): copy is NudgeCopy {
  if (!copy?.subject?.trim() || !copy.body?.trim()) return false;
  const subject = copy.subject.trim();
  const body = copy.body.trim();
  if (subject.length > MAX_SUBJECT || body.length > MAX_BODY) return false;
  if (/[\r\n]/.test(subject)) return false;
  if (/\{\{|\}\}|\[[^\]]*\]|https?:\/\/|www\./i.test(subject + body)) return false;
  return true;
}

export async function writeNudgeWithAI(context: NudgeContext): Promise<NudgeCopy | null> {
  try {
    const response = await generateStructuredContent({
      model: GEMINI_MODELS.fast,
      contents: `Write a short, friendly daily email nudge from a startup growth coach to a founder
who hasn't made progress on their active quest in the last day.

Founder first name: ${context.firstName ?? "(unknown, don't use a name)"}
Company: ${context.company ?? "unknown"}
Active quest: "${context.questTitle}"
Next unfinished step: ${context.nextStep ? `"${context.nextStep}"` : "none listed"}
Days left on the quest: ${context.daysLeft ?? "no deadline"}
Customers so far: ${context.customers} of 100

Rules:
- "subject": under 60 characters, specific to this quest, no emoji.
- "body": 2-3 short sentences, under 350 characters, written to the founder ("you").
  Urge them to spend just 10 minutes on the quest today, and name the next step if there is one.
  Warm and encouraging, never guilt-tripping. No greeting line, no sign-off, no links, no placeholders.`,
      schema: RESPONSE_SCHEMA,
    });
    const parsed = response.text ? (JSON.parse(response.text) as Partial<NudgeCopy>) : null;
    if (!isUsableNudge(parsed)) return null;
    return { subject: parsed.subject.trim(), body: parsed.body.trim() };
  } catch (err) {
    console.error("writeNudgeWithAI failed:", err);
    return null;
  }
}

export function fallbackNudge(context: NudgeContext): NudgeCopy {
  const step = context.nextStep ? ` Start with the next step: ${context.nextStep}` : "";
  return {
    subject: `10 minutes on "${context.questTitle}" today?`.slice(0, MAX_SUBJECT),
    body: `Your quest "${context.questTitle}" is still open. Ten focused minutes today keeps it moving.${step}`,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildNudgeEmailHtml(copy: NudgeCopy, context: NudgeContext, questUrl: string): string {
  const greeting = context.firstName ? `<p>Hi ${escapeHtml(context.firstName)},</p>` : "";
  return `${greeting}<p>${escapeHtml(copy.body)}</p><p><a href="${escapeHtml(questUrl)}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#1B1A25;color:#ffffff;text-decoration:none;font-weight:500">Open your quest</a></p><p style="color:#6b6880;font-size:13px">You're getting this because your quest hasn't moved in a day. You can turn these off in Settings → Notifications.</p>`;
}
