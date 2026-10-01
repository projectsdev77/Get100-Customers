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

const HERO_WELCOME_VARIANTS = [
  ILLUSTRATIONS.heroWelcomeMaya,
  ILLUSTRATIONS.heroWelcomeSam,
  ILLUSTRATIONS.heroWelcomeNoor,
  ILLUSTRATIONS.heroWelcomeLeo,
] as const;

const HERO_WELCOME_STORAGE_KEY = "g100_hero_welcome_variant";

// One random hero picked per founder on first load and kept (spec: "store
// in localStorage only; no backend field"). Falls back to a stable choice
// if localStorage is unavailable (private browsing, blocked storage).
export function pickHeroWelcomeIllustration(): string {
  try {
    const stored = window.localStorage.getItem(HERO_WELCOME_STORAGE_KEY);
    if (stored && (HERO_WELCOME_VARIANTS as readonly string[]).includes(stored)) {
      return stored;
    }
    const choice = HERO_WELCOME_VARIANTS[Math.floor(Math.random() * HERO_WELCOME_VARIANTS.length)];
    window.localStorage.setItem(HERO_WELCOME_STORAGE_KEY, choice);
    return choice;
  } catch {
    return HERO_WELCOME_VARIANTS[0];
  }
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

// desk (pre-growth-mode) / team (Growth Mode) / rooftop (1,000+), per the
// handoff's illustration table.
export function milestoneSceneIllustration(customers: number): string | null {
  if (customers >= 1000) return ILLUSTRATIONS.milestoneRooftop;
  if (customers >= 100) return ILLUSTRATIONS.milestoneTeam;
  if (customers >= 10) return ILLUSTRATIONS.milestoneDesk;
  return null;
}

export function milestoneCelebrationIllustration(milestone: number): string {
  if (milestone >= 1000) return ILLUSTRATIONS.milestoneRooftop;
  if (milestone >= 100) return ILLUSTRATIONS.milestoneTeam;
  return ILLUSTRATIONS.milestoneDesk;
}
