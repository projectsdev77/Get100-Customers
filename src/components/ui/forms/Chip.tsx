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
      className={`h-9 rounded-full px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border border-transparent bg-accent-soft text-primary shadow-[inset_0_0_0_1.5px_var(--accent)]"
          : "border border-strong bg-transparent text-primary hover:bg-action-2"
      } ${className}`}
    >
      {selected ? "✓ " : ""}
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
      onChange(option);
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
