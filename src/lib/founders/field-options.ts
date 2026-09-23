// Label <-> stored-value maps shared between the onboarding wizard and the
// settings profile form, so both use the same chip options and copy.
export const CHANNEL_OPTIONS = [
  "Cold email",
  "Warm intros",
  "Online communities",
  "Content",
  "Paid ads",
  "Partnerships",
];
export const CHANNEL_VALUES: Record<string, string> = {
  "Cold email": "cold_email",
  "Warm intros": "warm_intros",
  "Online communities": "communities",
  Content: "content",
  "Paid ads": "paid",
  Partnerships: "partnerships",
};
export const CHANNEL_LABELS = Object.fromEntries(
  Object.entries(CHANNEL_VALUES).map(([label, value]) => [value, label]),
);

export const STAGE_OPTIONS = ["Idea", "Prototype", "Launched"];
export const STAGE_VALUES: Record<string, string> = {
  Idea: "idea",
  Prototype: "prototype",
  Launched: "launched",
};
export const STAGE_LABELS = Object.fromEntries(
  Object.entries(STAGE_VALUES).map(([l, v]) => [v, l]),
);

export const HOURS_OPTIONS = ["1–2", "3–5", "6–10", "10+"];
export const HOURS_VALUES: Record<string, string> = {
  "1–2": "1-2",
  "3–5": "3-5",
  "6–10": "6-10",
  "10+": "10+",
};
export const HOURS_LABELS = Object.fromEntries(
  Object.entries(HOURS_VALUES).map(([l, v]) => [v, l]),
);
