"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cal, { getCalApi } from "@calcom/embed-react";
import { LinkButton } from "@/components/ui/actions/Button";
import { Card } from "@/components/ui/surfaces/Card";
import { CoachAvatar } from "@/components/coaching/CoachAvatar";

const NAMESPACE = "coaching";

type Booking = { title?: string; startTime?: string };

function formatStart(iso: string | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Follows the app's own theme override (data-theme on <html>) when one is
// set, otherwise lets Cal.com follow the OS like the rest of the app does.
function currentTheme(): "light" | "dark" | "auto" {
  const forced = document.documentElement.dataset.theme;
  return forced === "light" || forced === "dark" ? forced : "auto";
}

export function CoachBooking({
  coachName,
  coachTitle,
  photoUrl,
  calLink,
  founderName,
  founderEmail,
}: {
  coachName: string;
  coachTitle: string | null;
  photoUrl: string | null;
  calLink: string;
  founderName: string | null;
  founderEmail: string | null;
}) {
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    let active = true;
    let cal: Awaited<ReturnType<typeof getCalApi>> | null = null;
    const onBooked = (event: CustomEvent<{ data: { title?: string; startTime?: string } }>) => {
      if (active) setBooking({ title: event.detail.data.title, startTime: event.detail.data.startTime });
    };

    getCalApi({ namespace: NAMESPACE }).then((api) => {
      if (!active) return;
      cal = api;
      api("ui", { theme: currentTheme(), layout: "month_view" });
      api("on", { action: "bookingSuccessfulV2", callback: onBooked });
    });

    return () => {
      active = false;
      cal?.("off", { action: "bookingSuccessfulV2", callback: onBooked });
    };
  }, []);

  if (booking) {
    const when = formatStart(booking.startTime);
    return (
      <Card className="flex flex-col items-start gap-4 p-7">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-tile-level text-lg text-on-tile" aria-hidden="true">
          &#10003;
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-medium text-primary">You&apos;re booked with {coachName}</h2>
          {(booking.title || when) && (
            <p className="text-sm text-primary">
              {booking.title}
              {booking.title && when ? " · " : ""}
              {when}
            </p>
          )}
          <p className="max-w-[520px] text-sm text-secondary">
            Your calendar invite and Google Meet link are on their way by email. To reschedule or
            cancel, use the links in that email.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton href="/dashboard" size="sm">
            Done
          </LinkButton>
          <Link href="/coaching" className="text-sm font-medium text-accent">
            Book with another coach
          </Link>
        </div>
      </Card>
    );
  }

  const prefill: Record<string, string> = {};
  if (founderName) prefill.name = founderName;
  if (founderEmail) prefill.email = founderEmail;
  const directLink = `https://cal.com/${calLink}?${new URLSearchParams(prefill).toString()}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <CoachAvatar name={coachName} photoUrl={photoUrl} size={48} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-base font-medium text-primary">{coachName}</span>
          {coachTitle && <span className="text-sm text-secondary">{coachTitle}</span>}
        </div>
        <Link href="/coaching" className="text-sm font-medium text-accent">
          Choose another coach
        </Link>
      </div>
      <Card className="min-h-[640px] overflow-hidden p-2">
        <Cal
          namespace={NAMESPACE}
          calLink={calLink}
          config={{ ...prefill, layout: "month_view" }}
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
        />
      </Card>
      {/* Ad blockers or a flaky connection can stop Cal.com's embed script loading. */}
      <p className="text-[13px] text-secondary">
        Calendar not loading?{" "}
        <a href={directLink} target="_blank" rel="noopener noreferrer" className="font-medium text-accent">
          Open {coachName}&apos;s booking page
        </a>
      </p>
    </div>
  );
}
