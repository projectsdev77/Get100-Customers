// Customer-count milestones worth celebrating (SPEC §11 triggers).
// 100 is special-cased as Growth Mode entry, not just another number
// (SPEC §14 — reaching 100 isn't a hard stop).
const CUSTOMER_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];

export function crossedCustomerMilestone(oldCount: number, newCount: number): number | null {
  const crossed = CUSTOMER_MILESTONES.filter((m) => oldCount < m && newCount >= m);
  return crossed.length > 0 ? crossed[crossed.length - 1] : null;
}

export function milestoneMessage(milestone: number): { message: string; emailSubject: string; emailHtml: string } {
  if (milestone === 100) {
    return {
      message: "You've hit 100 customers — welcome to Growth Mode! Next stop: 250.",
      emailSubject: "100 customers — welcome to Growth Mode",
      emailHtml:
        "<p>You've reached <strong>100 customers</strong> — the original goal. You're now in <strong>Growth Mode</strong>, with a new stretch target of 250.</p>",
    };
  }
  return {
    message: `You've hit ${milestone} customers!`,
    emailSubject: `${milestone} customers — nice work`,
    emailHtml: `<p>You've reached <strong>${milestone} customers</strong> on your way to 100.</p>`,
  };
}
