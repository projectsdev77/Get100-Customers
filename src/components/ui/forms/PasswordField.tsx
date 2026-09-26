"use client";

import { useId, useState } from "react";
import { fieldClasses } from "@/components/ui/forms/Field";
import { PasswordVisibilityToggle } from "@/components/ui/forms/PasswordVisibilityToggle";
import { PASSWORD_REQUIREMENTS } from "@/lib/auth/password";

// Signup's password input. Requirements stay hidden until the founder
// starts typing (design ask: don't show the checklist up front), then
// track each rule live as they type.
export function PasswordField({
  label = "Password",
  name = "password",
}: {
  label?: string;
  name?: string;
}) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          required
          minLength={8}
          autoComplete="new-password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (!touched) setTouched(true);
          }}
          className={`${fieldClasses(false)} pr-11`}
        />
        <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible((v) => !v)} />
      </div>
      {touched && (
        <ul className="flex flex-col gap-1 pt-1">
          {PASSWORD_REQUIREMENTS.map((requirement) => {
            const met = requirement.test(value);
            return (
              <li
                key={requirement.id}
                className={`flex items-center gap-1.5 text-xs ${met ? "text-tile-level-ink" : "text-secondary"}`}
              >
                <span
                  className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[9px] ${
                    met ? "bg-tile-level text-on-tile" : "bg-sunken"
                  }`}
                >
                  {met ? "✓" : ""}
                </span>
                {requirement.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
