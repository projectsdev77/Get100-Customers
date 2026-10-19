import { milestoneEmail } from "@/lib/email/templates";

// Customer-count milestones worth celebrating (SPEC §11 triggers).
// 100 is special-cased as Growth Mode entry, not just another number
// (SPEC §14 — reaching 100 isn't a hard stop).
export const CUSTOMER_MILESTONES = [1, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

export function crossedCustomerMilestone(oldCount: number, newCount: number): number | null {
  const crossed = CUSTOMER_MILESTONES.filter((m) => oldCount < m && newCount >= m);
  return crossed.length > 0 ? crossed[crossed.length - 1] : null;
}

export function milestoneMessage(milestone: number): { message: string; emailSubject: string; emailHtml: string } {
  if (milestone === 1) {
    return {
      message: "Your first customer! That's the hardest one.",
      emailSubject: "You got your first customer!",
      emailHtml: milestoneEmail(milestone),
    };
  }
  if (milestone === 100) {
    return {
      message: "You've hit 100 customers! Welcome to Growth Mode. Next stop: 250.",
      emailSubject: "100 customers: welcome to Growth Mode",
      emailHtml: milestoneEmail(milestone),
    };
  }
  return {
    message: `You've hit ${milestone} customers!`,
    emailSubject: `${milestone} customers, nice work`,
    emailHtml: milestoneEmail(milestone),
  };
}
