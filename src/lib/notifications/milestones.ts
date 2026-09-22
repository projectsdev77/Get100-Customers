// Customer-count milestones worth celebrating (SPEC §11 triggers).
const CUSTOMER_MILESTONES = [10, 25, 50, 100];

export function crossedCustomerMilestone(oldCount: number, newCount: number): number | null {
  const crossed = CUSTOMER_MILESTONES.filter((m) => oldCount < m && newCount >= m);
  return crossed.length > 0 ? crossed[crossed.length - 1] : null;
}
