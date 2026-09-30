import type { ButtonHTMLAttributes } from "react";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected = false, className = "", children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...props}
      className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border border-transparent bg-accent-soft text-primary shadow-[inset_0_0_0_1.5px_var(--accent)]"
          : "border border-strong bg-transparent text-primary hover:bg-action-2"
      } ${className}`}
    >
      {/* Fixed-width slot regardless of selected state, so a chip's own
          width never changes on select/deselect — text previously grew by
          "✓ " when selected, which (in a flex-wrap row) visibly shifted
          every chip after it to a new position. Also kept out of the
          accessible name (aria-hidden) so a chip's label stays exactly its
          own text either way. */}
      <span aria-hidden="true" className="mr-1 inline-block w-3 shrink-0 text-center">
        {selected ? "✓" : ""}
      </span>
      {children}
    </button>
  );
}

export function ChipGroup({
  options,
  value,
  multi = true,
  onChange,
}: {
  options: string[];
  value: string | string[];
  multi?: boolean;
  onChange: (value: string | string[]) => void;
}) {
  const selected = Array.isArray(value) ? value : [value];
  const toggle = (option: string) => {
    if (multi) {
      onChange(
        selected.includes(option) ? selected.filter((v) => v !== option) : [...selected, option],
      );
    } else {
      // Clicking the already-selected option clears it — every field this
      // backs is nullable, so there's no reason a single-select group can't
      // go back to "nothing chosen" the same way a multi-select one can.
      onChange(option === value ? "" : option);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip key={option} selected={selected.includes(option)} onClick={() => toggle(option)}>
          {option}
        </Chip>
      ))}
    </div>
  );
}
