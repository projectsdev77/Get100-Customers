import type { SelectHTMLAttributes } from "react";
import { Field, fieldClasses } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: (string | SelectOption)[];
  placeholder?: string;
}

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          {...props}
          className={`${fieldClasses(Boolean(error))} cursor-pointer appearance-none pr-9 ${className}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) =>
            typeof o === "string" ? (
              <option key={o}>{o}</option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ),
          )}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary">
          ▾
        </span>
      </div>
    </Field>
  );
}
