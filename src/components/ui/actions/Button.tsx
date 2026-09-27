import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "outline" | "coach" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-action text-action-fg hover:bg-action-hover",
  secondary: "bg-action-2 text-primary hover:bg-action-2-hover",
  outline: "bg-transparent text-primary border border-strong hover:bg-action-2",
  coach: "bg-transparent text-accent hover:bg-accent-soft",
  danger: "bg-danger text-white hover:brightness-95",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
};

// Shared by Button and LinkButton so a link can look exactly like a
// button (e.g. a banner's "Go to billing" action) without an <a> nested
// inside a <button>, which is invalid HTML.
export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  fullWidth = false,
  className = "",
) {
  return `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background,transform] duration-200 ease-out active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

// Every button is a pill (design handoff). Hover/press/disabled/focus all
// ride on Tailwind pseudo-classes rather than JS state, so this stays a
// plain server-renderable component.
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return <button {...props} className={buttonClasses(variant, size, fullWidth, className)} />;
}

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} {...props} className={buttonClasses(variant, size, fullWidth, className)} />
  );
}
