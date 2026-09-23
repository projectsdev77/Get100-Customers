import type { ReactNode } from "react";

type Tone = "error" | "success" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  error: "bg-banner-error-bg border-banner-error-border text-banner-error-fg",
  success: "bg-banner-success-bg border-banner-success-border text-banner-success-fg",
  info: "bg-banner-info-bg border-banner-info-border text-banner-info-fg",
};

export function Banner({
  tone = "info",
  children,
  action,
}: {
  tone?: Tone;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-md border px-3.5 py-2.5 text-sm font-medium ${TONE_CLASSES[tone]}`}
    >
      <span>{children}</span>
      {action}
    </div>
  );
}
