// Single source of truth for password strength — used by the shared
// live checklist (components/ui/forms/PasswordField.tsx, used on both
// signup and the settings account form) and by every server action that
// sets a password, so the client-side UI and the server-side
// enforcement can never drift apart.
export const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    id: "special",
    label: "One special character (!@#$%^&*)",
    test: (password: string) => /[!@#$%^&*]/.test(password),
  },
] as const;

export function isPasswordValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));
}
