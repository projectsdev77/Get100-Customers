import type { BuyingMotion } from "@/types/database";

// Shared between selectNextQuestWithAI and generateNetNewQuest so window
// sizing and framing stay consistent across both AI-generation paths. A
// sales-led founder's cycle can span weeks, so a self-serve-sized window
// makes the quest's own "converted" success question unanswerable in time —
// this is the fix, not a new taxonomy of quest types (SPEC gap #7's "cheap
// path": sizing/expectations, not a rebuilt template system).
export const MOTION_DESCRIPTIONS: Record<BuyingMotion, string> = {
  self_serve: "self-serve — people sign up and pay without talking to the founder",
  sales_led: "sales-led — people need a call/demo before buying, and the cycle can take weeks",
  local_in_person: "local/in-person — customers are nearby and often met face to face",
};

const WINDOW_DAYS_RANGE: Partial<Record<BuyingMotion, string>> = {
  sales_led: "5-14",
};

const MAX_WINDOW_DAYS: Partial<Record<BuyingMotion, number>> = {
  sales_led: 14,
};

export function windowDaysRange(motion: BuyingMotion | null): string {
  return (motion && WINDOW_DAYS_RANGE[motion]) || "1-5";
}

export function maxWindowDays(motion: BuyingMotion | null): number {
  return (motion && MAX_WINDOW_DAYS[motion]) || 7;
}

export function motionPromptNote(motion: BuyingMotion | null): string {
  if (motion === "sales_led") {
    return ` This founder's customers need a sales conversation before buying,
which can take weeks — don't compress the window to a self-serve
timeline. If the deal itself likely won't close within the window, add
a second boolean/number question capturing an earlier, reachable signal
(e.g. "did you book a call or demo?"), so there's a meaningful answer
even while "converted" is still open.`;
  }
  if (motion === "local_in_person") {
    return ` This founder's customers are local/in-person — favor actions that
make sense face to face or in a specific place, not a purely remote/
online channel.`;
  }
  return "";
}
