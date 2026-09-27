import type { TextareaHTMLAttributes } from "react";
import { Field, fieldClasses } from "./Field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, rows = 3, className = "", ...props }: TextareaProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      <textarea
        {...props}
        rows={rows}
        className={`${fieldClasses(Boolean(error))} h-auto resize-y py-3 ${className}`}
      />
    </Field>
  );
}
