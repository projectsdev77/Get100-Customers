import { heroForToday } from "@/lib/celebrations/illustrations";
import { DecorativeImage } from "./DecorativeImage";

// Screen card A (06-illustration-placement §3): the daily hero rotation is
// now a pure function of (founderId, today's date), so unlike the earlier
// random-and-remember-in-localStorage version this needs no client-side
// state or effect — it renders identically on the server, avoiding the
// "pops in a frame late" tradeoff that version had.
export function HeroWelcomeIllustration({
  founderId,
  className,
}: {
  founderId: string | null | undefined;
  className?: string;
}) {
  return <DecorativeImage src={heroForToday(founderId)} className={className} eager />;
}
