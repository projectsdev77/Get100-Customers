"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./Button";

// useFormStatus only reports the nearest enclosing <form>'s pending
// state, so this has to be its own client component rendered inside that
// form — a parent reading pending itself and passing it down wouldn't
// work. Generalized out of /auth/confirm's local SubmitButton (which this
// replaces) so every form action in the app gets the same pending
// feedback instead of each page reinventing it (or, as on the admin
// founder page, not having it at all).
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: ButtonProps & { pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
