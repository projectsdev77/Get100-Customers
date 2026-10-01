// Static map of the handoff's illustration assets (public/illustrations/,
// transparent WebP — originals were white/black-background JPGs, background
// removed and exported at ~2x the largest box any of them is used at). Every
// consumer must treat a missing/failed image as a no-op (alt="" +
// aria-hidden, onError hides the element), never a broken-image icon.
export const ILLUSTRATIONS = {
  firstCustomer: "/illustrations/first-customer.webp",
  milestoneDesk: "/illustrations/milestone-desk.webp",
  milestoneTeam: "/illustrations/milestone-team.webp",
  milestoneRooftop: "/illustrations/milestone-rooftop.webp",
  growthMode: "/illustrations/growth-mode.webp",
  emptyNoActive: "/illustrations/empty-no-active.webp",
  emptyNoSuggested: "/illustrations/empty-no-suggested.webp",
  emptyNotifications: "/illustrations/empty-notifications.webp",
  emptyNotificationsDark: "/illustrations/empty-notifications-dark.webp",
  heroWelcomeMaya: "/illustrations/hero-welcome-maya.webp",
  heroWelcomeSam: "/illustrations/hero-welcome-sam.webp",
  heroWelcomeNoor: "/illustrations/hero-welcome-noor.webp",
  heroWelcomeLeo: "/illustrations/hero-welcome-leo.webp",
  spotQuest: "/illustrations/spot-quest.webp",
  spotJournal: "/illustrations/spot-journal.webp",
  spotCoach: "/illustrations/spot-coach.webp",
  catOutreach: "/illustrations/cat-outreach.webp",
  catContent: "/illustrations/cat-content.webp",
  catPartnership: "/illustrations/cat-partnership.webp",
  catAds: "/illustrations/cat-ads.webp",
  promoStreak: "/illustrations/promo-streak.webp",
  promoStreakDark: "/illustrations/promo-streak-dark.webp",
  promoUpgrade: "/illustrations/promo-upgrade.webp",
  onboardingWelcome: "/illustrations/onboarding-welcome.webp",
} as const;

const HERO_NAMES = ["maya", "sam", "noor", "leo"] as const;
const HERO_ASSET_BY_NAME: Record<(typeof HERO_NAMES)[number], string> = {
  maya: ILLUSTRATIONS.heroWelcomeMaya,
  sam: ILLUSTRATIONS.heroWelcomeSam,
  noor: ILLUSTRATIONS.heroWelcomeNoor,
  leo: ILLUSTRATIONS.heroWelcomeLeo,
};

// Deterministic daily rotation (06-illustration-placement README §3) —
// replaces the earlier random-pick-and-store-in-localStorage version.
// Runs identically on server and client (same Date.now() day, modulo a
// midnight-boundary edge case the handoff accepts), so it no longer needs
// to be a client-only effect — safe to call straight from a Server
// Component. No id (logged-out preview) falls back to "maya".
export function heroForToday(founderId: string | null | undefined): string {
  if (!founderId) return HERO_ASSET_BY_NAME.maya;
  const day = Math.floor(Date.now() / 86_400_000);
  let hash = 0;
  for (const ch of String(founderId)) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const offset = Math.abs(hash) % HERO_NAMES.length;
  const name = HERO_NAMES[(day + offset) % HERO_NAMES.length];
  return HERO_ASSET_BY_NAME[name];
}

// Real quest category taxonomy (src/lib/ai/select-quest.ts) has 8 values;
// the handoff only delivered 4 category illustrations, so the rest share
// the generic "outreach" scene rather than going without one.
const CATEGORY_ILLUSTRATIONS: Record<string, string> = {
  content: ILLUSTRATIONS.catContent,
  paid: ILLUSTRATIONS.catAds,
  partnerships: ILLUSTRATIONS.catPartnership,
  cold_email: ILLUSTRATIONS.catOutreach,
  warm_intros: ILLUSTRATIONS.catOutreach,
  communities: ILLUSTRATIONS.catOutreach,
  referrals: ILLUSTRATIONS.catOutreach,
  local_events: ILLUSTRATIONS.catOutreach,
};

export function illustrationForCategory(category: string | null | undefined): string | null {
  if (!category) return null;
  return CATEGORY_ILLUSTRATIONS[category] ?? null;
}

// Customers-tile scene thresholds per 06-illustration-placement §4 (desk
// 0-249, team 250-999, rooftop 1,000+) — a different cutover than the
// celebration modal's own desk/team/rooftop-by-milestone mapping below,
// and always shows something now (no more "nothing below 10 customers").
export function milestoneSceneIllustration(customers: number): string {
  if (customers >= 1000) return ILLUSTRATIONS.milestoneRooftop;
  if (customers >= 250) return ILLUSTRATIONS.milestoneTeam;
  return ILLUSTRATIONS.milestoneDesk;
}

export function milestoneCelebrationIllustration(milestone: number): string {
  if (milestone >= 1000) return ILLUSTRATIONS.milestoneRooftop;
  if (milestone >= 100) return ILLUSTRATIONS.milestoneTeam;
  return ILLUSTRATIONS.milestoneDesk;
}
