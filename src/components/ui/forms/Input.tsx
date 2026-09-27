import type { InputHTMLAttributes } from "react";
import { Field, fieldClasses } from "./Field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className = "", ...props }: InputProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      <input {...props} className={`${fieldClasses(Boolean(error))} ${className}`} />
    </Field>
  );
}
