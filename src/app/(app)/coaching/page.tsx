import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { getSubscription, hasPaidAccess } from "@/lib/subscriptions/status";
import { calUsername } from "@/lib/coaching/cal-link";
import type { Coach } from "@/types/database";
import { Card } from "@/components/ui/surfaces/Card";
import { Banner } from "@/components/ui/surfaces/Banner";
import { LinkButton } from "@/components/ui/actions/Button";
import { CoachAvatar } from "@/components/coaching/CoachAvatar";
import { CoachBooking } from "./coach-booking";

type BookableCoach = Pick<Coach, "id" | "name" | "title" | "photo_url"> & { cal_link: string };

const SESSION_TYPES = ["Weekly 1-on-1 Growth Strategy Call", "Weekly Outreach & ICP Review"];

export default async function CoachingPage({
  searchParams,
}: {
  searchParams: Promise<{ coach?: string }>;
}) {
  const { coach: selectedId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const founder = await getCurrentFounder(supabase);
  if (!user || !founder) redirect("/login");
  if (!founder.industry || !founder.product_description) redirect("/onboarding");

  const subscription = await getSubscription(supabase, founder.id);

  const header = (
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">1-on-1 coaching</h1>
      <p className="max-w-[620px] text-sm text-secondary">
        Book a weekly session with a human growth coach: a {SESSION_TYPES[0]} or a {SESSION_TYPES[1]}.
      </p>
    </div>
  );

  if (!hasPaidAccess(subscription)) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card className="flex flex-col items-start gap-3 p-7">
          <h2 className="text-lg font-medium text-primary">Included with a paid plan</h2>
          <p className="max-w-[520px] text-sm text-secondary">
            {subscription?.status === "trialing"
              ? "You're on the free trial. Subscribe to book weekly 1-on-1 sessions with a growth coach."
              : "Subscribe to book weekly 1-on-1 sessions with a growth coach."}
          </p>
          <LinkButton href="/settings?tab=billing" size="sm">
            Go to billing
          </LinkButton>
        </Card>
      </div>
    );
  }

  // coaches has RLS with no policies (schema.sql), so it's read with the
  // service-role client, and only after the paid-access check above.
  const { data } = await createAdminClient()
    .from("coaches")
    .select("id, name, title, photo_url, cal_link")
    .eq("is_active", true)
    .not("cal_link", "is", null)
    .order("name")
    .returns<BookableCoach[]>();
  const coaches = data ?? [];
  const selected = coaches.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-col gap-6">
      {header}
      <Banner tone="info">
        This page is for booking. Your Meet link, and links to reschedule or cancel, are in your
        confirmation email and calendar.
      </Banner>

      {selected ? (
        <CoachBooking
          key={selected.id}
          coachName={selected.name}
          coachTitle={selected.title}
          photoUrl={selected.photo_url}
          calLink={calUsername(selected.cal_link)}
          founderName={founder.name}
          founderEmail={user.email ?? null}
        />
      ) : coaches.length === 0 ? (
        <Card className="p-7 text-sm text-secondary">
          No coaches are taking bookings right now. Check back soon.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <Link
              key={coach.id}
              href={`/coaching?coach=${coach.id}`}
              className="group flex flex-col gap-4 rounded-panel bg-card p-5 transition-shadow duration-200 hover:shadow-[0_0_0_2px_var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-center gap-4">
                <CoachAvatar name={coach.name} photoUrl={coach.photo_url} size={64} />
                <div className="flex min-w-0 flex-col">
                  <span className="text-base font-medium text-primary">{coach.name}</span>
                  {coach.title && <span className="text-sm text-secondary">{coach.title}</span>}
                </div>
              </div>
              <span className="text-sm font-medium text-accent">See availability →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
