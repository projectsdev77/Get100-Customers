import type { ReactNode } from "react";

export const fieldClasses = (error?: boolean) =>
  `h-11 w-full rounded-field border bg-card px-3.5 text-sm text-primary outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-secondary focus:shadow-[0_0_0_3px_var(--accent-soft)] ${
    error ? "border-danger" : "border-strong focus:border-accent"
  }`;

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[13px] font-medium text-primary">{label}</span>}
      {children}
      {(error || hint) && (
        <span className={`text-xs ${error ? "text-danger" : "text-secondary"}`}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
