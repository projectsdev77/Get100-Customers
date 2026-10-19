import { renderEmail, type EmailStat } from "./layout";

const NOTIFICATION_REASON = "You're getting this because email updates are on for your Get100 account.";

function progressStats(customers: number, streak: number): EmailStat[] {
  const stats: EmailStat[] = [{ value: `${customers}/100`, label: "customers" }];
  if (streak > 0) stats.push({ value: String(streak), label: "day streak" });
  return stats;
}

export function dailyNudgeEmail(input: {
  subject: string;
  body: string;
  firstName: string | null;
  questId: string;
  questTitle: string;
  nextStep: string | null;
  daysLeft: number | null;
  customers: number;
  streak: number;
}): string {
  const details: string[] = [];
  if (input.nextStep) details.push(`Next step: ${input.nextStep}`);
  if (input.daysLeft !== null) details.push(input.daysLeft === 1 ? "1 day left" : `${input.daysLeft} days left`);
  return renderEmail({
    preheader: input.body,
    eyebrow: "10 minutes today",
    title: input.subject,
    greeting: input.firstName ? `Hi ${input.firstName},` : null,
    paragraphs: [input.body],
    image: { file: "spot-quest.png", alt: "" },
    quest: { title: input.questTitle, details },
    stats: progressStats(input.customers, input.streak),
    button: { label: "Open your quest", path: `/quests#quest-${input.questId}` },
    reason: "You're getting this because your quest hasn't moved in a day.",
  });
}

export function questCheckInEmail(input: { questId: string; questTitle: string }): string {
  return renderEmail({
    preheader: `It's been a couple of days since you started "${input.questTitle}".`,
    eyebrow: "Check-in",
    title: "How's your quest going?",
    paragraphs: [
      `It's been a couple of days since you started this quest.`,
      "Stuck, short on time, or want a different approach? Open the app and ask your coach. We'll figure out the next move together.",
    ],
    image: { file: "spot-coach.png", alt: "" },
    quest: { title: input.questTitle },
    button: { label: "Open your quest", path: `/quests#quest-${input.questId}` },
    reason: NOTIFICATION_REASON,
  });
}

export function questDueSoonEmail(input: { questId: string; questTitle: string }): string {
  return renderEmail({
    preheader: `"${input.questTitle}" is due soon.`,
    eyebrow: "Due soon",
    title: "Your quest is almost due",
    paragraphs: ["A little progress today keeps your streak alive."],
    image: { file: "promo-streak.png", alt: "" },
    quest: { title: input.questTitle },
    button: { label: "Open your quest", path: `/quests#quest-${input.questId}` },
    reason: NOTIFICATION_REASON,
  });
}

export function reEngagementEmail(): string {
  return renderEmail({
    preheader: "You've got an open quest waiting.",
    eyebrow: "Still there?",
    title: "Your quest is waiting",
    paragraphs: ["You've got an open quest waiting for you. Need a hand getting started? Your coach is one click away."],
    image: { file: "empty-no-active.png", alt: "" },
    button: { label: "Open your quests", path: "/quests" },
    reason: NOTIFICATION_REASON,
  });
}

export function weeklyRecapEmail(input: {
  questsCompleted: number;
  customersThisWeek: number;
  totalCustomers: number;
}): string {
  const gained = `${input.customersThisWeek >= 0 ? "+" : ""}${input.customersThisWeek}`;
  return renderEmail({
    preheader: `${input.questsCompleted} quests completed, ${gained} customers this week.`,
    eyebrow: "Your week",
    title: "Your weekly growth recap",
    paragraphs: [
      input.totalCustomers >= 100
        ? `You're at ${input.totalCustomers} customers. Keep building in Growth Mode.`
        : `You're at ${input.totalCustomers} of 100 customers. Here's what moved this week.`,
    ],
    image: { file: "milestone-desk.png", alt: "", wide: true },
    stats: [
      { value: String(input.questsCompleted), label: input.questsCompleted === 1 ? "quest done" : "quests done" },
      { value: gained, label: "customers" },
      { value: `${input.totalCustomers}/100`, label: "total" },
    ],
    button: { label: "See your dashboard", path: "/dashboard" },
    reason: NOTIFICATION_REASON,
  });
}

export function levelUpEmail(level: number): string {
  return renderEmail({
    preheader: `You just reached level ${level}.`,
    eyebrow: "Level up",
    title: `You reached level ${level}`,
    paragraphs: ["Every quest you finish moves you closer to 100 customers. Keep going."],
    image: { file: "promo-streak.png", alt: "", tone: "lime" },
    button: { label: "See your progress", path: "/dashboard" },
    reason: NOTIFICATION_REASON,
  });
}

export function milestoneEmail(milestone: number): string {
  if (milestone === 1) {
    return renderEmail({
      preheader: "You just landed your first customer.",
      eyebrow: "Customer #1",
      title: "Your first customer!",
      paragraphs: ["That's the hardest one. Everything after this gets a little easier."],
      image: { file: "first-customer.png", alt: "", tone: "lime" },
      button: { label: "See your dashboard", path: "/dashboard" },
      reason: NOTIFICATION_REASON,
    });
  }
  if (milestone === 100) {
    return renderEmail({
      preheader: "You've reached 100 customers. Welcome to Growth Mode.",
      eyebrow: "Milestone",
      title: "100 customers. Welcome to Growth Mode.",
      paragraphs: ["You hit the original goal. Your new stretch target is 250. Same quests, bigger goal."],
      image: { file: "growth-mode.png", alt: "", wide: true, tone: "lime" },
      button: { label: "Enter Growth Mode", path: "/dashboard" },
      reason: NOTIFICATION_REASON,
    });
  }
  const image = milestone >= 1000 ? "milestone-rooftop.png" : milestone >= 250 ? "milestone-team.png" : "milestone-desk.png";
  return renderEmail({
    preheader: `You've reached ${milestone} customers.`,
    eyebrow: "Milestone",
    title: `${milestone} customers!`,
    paragraphs: [
      milestone < 100
        ? `You've reached ${milestone} customers on your way to 100. Nice work.`
        : `You've reached ${milestone} customers. Keep the momentum going.`,
    ],
    image: { file: image, alt: "", wide: true, tone: "lime" },
    button: { label: "See your dashboard", path: "/dashboard" },
    reason: NOTIFICATION_REASON,
  });
}

export function adminMessageEmail(message: string): string {
  return renderEmail({
    preheader: message.slice(0, 120),
    eyebrow: "From the Get100 team",
    title: "A message from the team",
    paragraphs: message.split(/\n{2,}|\r?\n/).map((line) => line.trim()),
    button: { label: "Open Get100", path: "/dashboard" },
    reason: "This is a direct message from the Get100-Customers team.",
  });
}
