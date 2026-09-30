import { Button } from "@/components/ui/actions/Button";
import { Select } from "@/components/ui/forms/Select";
import { skipQuest } from "./actions";

const SKIP_REASONS = [
  { value: "too_hard", label: "Too hard" },
  { value: "not_relevant", label: "Not relevant" },
  { value: "already_tried", label: "Already tried" },
  { value: "no_time", label: "No time" },
];

export function SkipForm({ questId, size = "sm" }: { questId: string; size?: "sm" | "md" }) {
  return (
    <form action={skipQuest} className="flex items-center gap-2">
      <input type="hidden" name="questId" value={questId} />
      <Select name="reason" placeholder="Not for me…" options={SKIP_REASONS} className="w-40" />
      <Button type="submit" variant="secondary" size={size}>
        Skip
      </Button>
    </form>
  );
}

export const SKIP_REASON_LABELS: Record<string, string> = Object.fromEntries(
  SKIP_REASONS.map((r) => [r.value, r.label]),
);
