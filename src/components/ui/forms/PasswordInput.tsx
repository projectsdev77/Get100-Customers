"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Field, fieldClasses } from "./Field";
import { PasswordVisibilityToggle } from "./PasswordVisibilityToggle";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
  error?: string;
}

// A plain password field with a show/hide toggle, for an EXISTING
// password (login, settings' current-password, confirm-password) —
// no strength checklist. For creating a new password, use PasswordField.
export function PasswordInput({ label, hint, error, className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`${fieldClasses(Boolean(error))} pr-11 ${className}`}
        />
        <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible((v) => !v)} />
      </div>
    </Field>
  );
}
