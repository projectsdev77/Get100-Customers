import { createAdminClient } from "@/lib/supabase/admin";
import type { Coach } from "@/types/database";
import { Card } from "@/components/ui/surfaces/Card";
import { Banner } from "@/components/ui/surfaces/Banner";
import { Input } from "@/components/ui/forms/Input";
import { SubmitButton } from "@/components/ui/actions/SubmitButton";
import { CoachAvatar } from "@/components/coaching/CoachAvatar";
import { CoachPhotoInput } from "./photo-input";
import { createCoach, updateCoach } from "./actions";

function bookingStatus(coach: Coach): { label: string; dot: string } {
  if (!coach.is_active) return { label: "Hidden", dot: "bg-strong" };
  if (!coach.cal_link) return { label: "Not set up", dot: "bg-[#C9A227]" };
  return { label: "Bookable", dot: "bg-[#7BA31A]" };
}

function CoachFields({ coach }: { coach?: Coach }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Name" name="name" required maxLength={80} defaultValue={coach?.name ?? ""} />
      <Input
        label="Title"
        name="title"
        maxLength={100}
        placeholder="e.g. B2B SaaS growth coach"
        defaultValue={coach?.title ?? ""}
      />
      <Input
        label="Cal.com profile link"
        name="calLink"
        placeholder="cal.com/username"
        hint="The profile link, not a single event, so founders see both session types."
        defaultValue={coach?.cal_link ?? ""}
      />
      <CoachPhotoInput currentUrl={coach?.photo_url ?? null} />
    </div>
  );
}

export default async function AdminCoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ flash?: string; tone?: string }>;
}) {
  const { flash, tone } = await searchParams;
  const admin = createAdminClient();
  const { data } = await admin
    .from("coaches")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Coach[]>();
  const coaches = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-primary">Coaches</h1>
        <p className="max-w-[640px] text-sm text-secondary">
          Founders on a paid plan can book weekly 1-on-1 sessions with any coach marked bookable.
          Bookings, limits, reminders and Meet links are all handled in each coach&apos;s Cal.com
          account.
        </p>
      </div>

      {flash && <Banner tone={tone === "error" ? "error" : "success"}>{flash}</Banner>}

      <section className="flex flex-col gap-3">
        {coaches.length === 0 ? (
          <Card className="p-6 text-sm text-secondary">No coaches yet. Add the first one below.</Card>
        ) : (
          coaches.map((coach) => {
            const status = bookingStatus(coach);
            return (
              <Card key={coach.id} className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <CoachAvatar name={coach.name} photoUrl={coach.photo_url} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-base font-medium text-primary">{coach.name}</span>
                    <span className="text-sm text-secondary">{coach.title ?? "No title yet"}</span>
                    {coach.cal_link && (
                      <a
                        href={coach.cal_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit text-[13px] font-medium text-accent"
                      >
                        {coach.cal_link.replace("https://", "")}
                      </a>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                <details className="group border-t border-subtle pt-3">
                  <summary className="w-fit cursor-pointer text-sm font-medium text-accent">Edit</summary>
                  <form action={updateCoach} className="mt-4 flex flex-col gap-4">
                    <input type="hidden" name="coachId" value={coach.id} />
                    <CoachFields coach={coach} />
                    <div className="flex flex-wrap items-center gap-5 text-sm text-primary">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="isActive" defaultChecked={coach.is_active} />
                        Show to founders
                      </label>
                      {coach.photo_url && (
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" name="removePhoto" />
                          Remove photo
                        </label>
                      )}
                    </div>
                    <SubmitButton size="sm" className="w-fit" pendingLabel="Saving…">
                      Save changes
                    </SubmitButton>
                  </form>
                </details>
              </Card>
            );
          })
        )}
      </section>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-base font-medium text-primary">Add a coach</h2>
        <form action={createCoach} className="flex flex-col gap-4">
          <CoachFields />
          <SubmitButton size="sm" className="w-fit" pendingLabel="Adding…">
            Add coach
          </SubmitButton>
        </form>
      </Card>

      <Card className="flex flex-col gap-2 p-6 text-sm text-secondary">
        <h2 className="text-base font-medium text-primary">Each coach&apos;s Cal.com setup</h2>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5">
          <li>
            Create two event types: <span className="text-primary">Weekly 1-on-1 Growth Strategy Call</span>{" "}
            and <span className="text-primary">Weekly Outreach &amp; ICP Review</span>. Hide or delete the
            default events.
          </li>
          <li>
            On each event, under Limits, turn on the per-booker limit on upcoming bookings and set it to
            1, and limit future bookings to 7 days ahead. Together that keeps each founder to about one
            session a week. Don&apos;t use &quot;Limit booking frequency&quot;: it caps the coach&apos;s
            total bookings across all founders.
          </li>
          <li>Connect Google Calendar and set the location to Google Meet.</li>
          <li>Set a display name and photo, then paste the profile link (cal.com/username) here.</li>
        </ol>
      </Card>
    </div>
  );
}
