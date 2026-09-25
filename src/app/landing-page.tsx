"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Demo numbers for the product showcase ring — purely illustrative
// marketing content, not real founder data. Values match the copy
// ("63 more to your first 100", "60 / 100 XP").
const DEMO_CUSTOMERS = 37;
const DEMO_XP = 60;

const FEATURES = [
  {
    dot: "bg-tile-customers",
    title: "Every quest says why",
    body: "Tap “Why this?” to see the reasoning, pulled from what you told us — never generic advice.",
  },
  {
    dot: "bg-tile-level",
    title: "Skipping is always fine",
    body: "Tell us why a quest isn't right and the next one gets better. No guilt, no streak shaming.",
  },
  {
    dot: "bg-tile-streak",
    title: "Ask your coach anything",
    body: "Stuck on a quest? Chat it through. Your coach can suggest a swap — you decide.",
  },
  {
    dot: "bg-accent",
    title: "Past 100? Keep going.",
    body: "Growth Mode sets your next target — 250, 500, 1,000 — with the same quest loop.",
  },
];

const BAND_ITEMS = ["Setup in 3 minutes", "Skip any quest", "3 quests at a time", "Cancel whenever"];

const STEPS = [
  {
    n: "01",
    t: "Tell us about your startup",
    d: "Eight quick questions: what you sell, who it's for, what you've tried, how much time you have.",
  },
  {
    n: "02",
    t: "Get quests sized to your week",
    d: "Up to three at a time, each with a ready-to-use tool — an email draft, a post, a call script.",
  },
  {
    n: "03",
    t: "Report back, level up",
    d: "Tell your coach what happened. Earn XP, keep your streak, and log every new customer.",
  },
];

const PERKS = [
  "Unlimited quests, sized to your week",
  "Coach chat with quest swaps",
  "Progress, XP and streak tracking",
  "Growth Mode past 100 customers",
];

const FAQS = [
  {
    q: "Is this just ChatGPT with a coat of paint?",
    a: "No. Your coach works from your onboarding answers and every quest report, and each quest comes with a specific tool — not a wall of generic advice.",
  },
  {
    q: "How much time does it take?",
    a: "You tell us your weekly hours during setup. Quests are sized to fit, and you can skip or swap any of them.",
  },
  {
    q: "What if I already have some customers?",
    a: "Enter your current count during onboarding. The ring starts there, and past 100 you move into Growth Mode.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, any time from Billing. You keep access until the end of the period you paid for.",
  },
];

function useFillAnimation() {
  const [fill, setFill] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      frameRef.current = requestAnimationFrame(() => setFill(1));
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / 1000);
        setFill(1 - Math.pow(1 - k, 3));
        if (k < 1) frameRef.current = requestAnimationFrame(step);
      };
      frameRef.current = requestAnimationFrame(step);
    }, 300);
    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return fill;
}

function Nav() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 py-5">
      <span className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.01em] text-primary">
        Get100-Customers
      </span>
      <div className="hidden flex-wrap gap-1 sm:flex">
        <a
          href="#how"
          className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-sunken hover:text-primary"
        >
          How it works
        </a>
        <a
          href="#pricing"
          className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-sunken hover:text-primary"
        >
          Pricing
        </a>
        <a
          href="#faq"
          className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-sunken hover:text-primary"
        >
          FAQ
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/login"
          className="inline-flex h-10 items-center whitespace-nowrap rounded-full px-4.5 text-sm font-medium text-primary shadow-[inset_0_0_0_1px_var(--border-strong)] transition-colors duration-200 hover:bg-sunken"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-10 items-center whitespace-nowrap rounded-full bg-action px-4.5 text-sm font-medium text-action-fg transition-colors duration-200 hover:bg-action-hover"
        >
          Start my quest log
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      data-screen-label="Hero"
      className="grid flex-1 items-stretch overflow-hidden rounded-shell bg-sunken lg:grid-cols-2"
    >
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:px-10 sm:py-16 lg:items-start lg:px-16 lg:py-20 lg:text-left">
        <span className="inline-flex w-fit items-center gap-2 self-center rounded-full bg-card px-3 py-1.5 text-[13px] font-medium text-secondary lg:self-start">
          <span className="h-2 w-2 rounded-full bg-accent" />
          An AI growth coach for early-stage founders
        </span>
        <h1 className="text-balance text-[44px] font-medium leading-[1.04] tracking-[-0.04em] text-primary sm:text-6xl lg:text-7xl">
          Your first
          <br />
          <span className="inline-block rounded-[0.35em] bg-tile-level px-[0.22em] py-0 text-on-tile">
            100 customers,
          </span>
          <br />
          one quest at a time.
        </h1>
        <p className="max-w-[480px] text-balance text-base text-secondary sm:text-xl">
          Tell us what you sell and who it&apos;s for. Every week your coach hands you a few
          small, specific quests — and you watch the ring fill.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
          <Link
            href="/signup"
            className="inline-flex h-[52px] items-center gap-3 rounded-full bg-action py-0 pl-6 pr-2 text-base font-medium text-action-fg transition-colors duration-200 hover:bg-action-hover"
          >
            Start my quest log
            <span className="grid h-9 w-9 place-items-center rounded-full bg-tile-level text-on-tile">
              &rarr;
            </span>
          </Link>
          <a
            href="#how"
            className="inline-flex h-[52px] items-center rounded-full px-5 text-base font-medium text-primary transition-colors duration-200 hover:bg-card"
          >
            See how it works
          </a>
        </div>
        <span className="text-[13px] text-secondary">
          Setup takes about 3 minutes. Skip any quest, any time.
        </span>
      </div>
      <div className="relative hidden min-h-[320px] lg:block">
        <Image
          src="/illustrations/hero-light.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 0px"
          className="hero-illustration-light object-contain object-bottom p-8"
        />
        <Image
          src="/illustrations/hero-dark.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 0px"
          className="hero-illustration-dark object-contain object-bottom p-8"
        />
      </div>
    </section>
  );
}

function DemoRing({
  fill,
  diameter,
  thickness,
  ringColor,
  trackColor,
  tileColor,
  children,
}: {
  fill: number;
  diameter: number;
  thickness: number;
  ringColor: string;
  trackColor: string;
  tileColor: string;
  children: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: diameter,
        height: diameter,
        background: `conic-gradient(${ringColor} 0 ${pct}%, ${trackColor} ${pct}% 100%)`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full text-on-tile"
        style={{ width: diameter - thickness * 2, height: diameter - thickness * 2, background: tileColor }}
      >
        {children}
      </div>
    </div>
  );
}

function ProductShowcase() {
  const fill = useFillAnimation();
  const customers = Math.round(DEMO_CUSTOMERS * fill);
  const xp = Math.round(DEMO_XP * fill);

  return (
    <section
      data-screen-label="Product"
      className="grid items-center gap-10 py-20 sm:gap-16 sm:py-28 lg:grid-cols-2 lg:gap-24 lg:py-36"
    >
      <div className="flex w-full max-w-[600px] flex-col gap-2.5 justify-self-center rounded-shell bg-sunken p-2.5">
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-tile bg-tile-customers px-6 py-7 text-on-tile">
          <DemoRing
            fill={fill}
            diameter={148}
            thickness={13}
            ringColor="var(--ring-customers)"
            trackColor="var(--ring-track-customers)"
            tileColor="var(--tile-customers)"
          >
            <span className="text-[50px] font-light leading-none tracking-[-0.04em]">{customers}</span>
            <span className="text-xs font-medium text-tile-customers-ink">of 100</span>
          </DemoRing>
          <div className="flex max-w-[220px] flex-col gap-2">
            <span className="text-[15px] font-medium">Customers</span>
            <span className="text-xl leading-[1.2] tracking-[-0.01em]">63 more to your first 100</span>
            <span className="self-start rounded-full bg-white/75 px-2.5 py-1 text-xs font-medium">
              +3 this week
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-3 rounded-tile bg-tile-level p-4 text-on-tile">
            <DemoRing
              fill={fill}
              diameter={56}
              thickness={6}
              ringColor="var(--ring-level)"
              trackColor="var(--ring-track-level)"
              tileColor="var(--tile-level)"
            >
              <span className="text-[15px] font-medium leading-none">4</span>
            </DemoRing>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium">Level 4</span>
              <span className="text-xs text-tile-level-ink">{xp} / 100 XP</span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-1.5 rounded-tile bg-tile-streak p-4 text-on-tile">
            <span className="text-[13px] font-medium">Streak</span>
            <span className="text-[28px] font-light leading-none">
              5<span className="text-[13px] text-tile-streak-ink"> days</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-tile bg-card p-4.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-quest-active px-2.5 text-xs font-medium text-on-tile">
              <span className="h-1.5 w-1.5 rounded-full bg-quest-active-ink" />
              Active
            </span>
            <span className="inline-flex h-6 items-center rounded-full bg-tile-level px-2.5 text-xs font-medium text-on-tile">
              +50 XP
            </span>
          </div>
          <span className="text-lg font-medium leading-[1.25] tracking-[-0.01em] text-primary">
            Book 3 discovery calls from your warm list
          </span>
          <div className="flex gap-2.5 rounded-tile bg-accent-soft p-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="text-[13px] leading-[1.5] text-primary">
              Why this? Two people replied to last month&apos;s emails. A short call turns warm
              replies into customers faster than new outreach.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-0 lg:px-8">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`grid grid-cols-[14px_minmax(0,1fr)] gap-4.5 py-6 ${
              i < FEATURES.length - 1 ? "border-b border-subtle" : ""
            }`}
          >
            <span className={`mt-1.5 h-3 w-3 rounded-full ${f.dot}`} />
            <div className="flex flex-col gap-1.5">
              <span className="text-xl font-medium leading-[1.3] tracking-[-0.01em] text-primary">
                {f.title}
              </span>
              <span className="max-w-[440px] text-[15px] leading-[1.6] text-secondary text-balance">
                {f.body}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Band() {
  return (
    <section
      data-screen-label="Band"
      className="mb-4 flex flex-wrap items-center justify-center gap-4 rounded-panel bg-tile-level px-6 py-10 sm:gap-16 sm:px-14 sm:py-14"
    >
      {BAND_ITEMS.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-3 whitespace-nowrap font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-900)] sm:text-[15px]"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--ink-900)]" />
          {item}
        </span>
      ))}
    </section>
  );
}

function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section
      id="how"
      data-screen-label="How it works"
      className="flex flex-col items-center gap-3.5 py-16 text-center sm:py-24"
    >
      <span className="text-[13px] font-medium tracking-[0.08em] text-secondary">HOW IT WORKS</span>
      <h2 className="max-w-[820px] text-balance text-3xl font-medium leading-[1.1] tracking-[-0.03em] text-primary sm:text-5xl">
        A coach that knows your startup, not a chatbot that knows everything.
      </h2>
      <div className="mt-10 grid w-full grid-cols-1 rounded-panel text-left shadow-[inset_0_0_0_1px_var(--border-subtle)] sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const isActive = active === i;
          return (
            <div
              key={s.n}
              onMouseEnter={() => setActive(i)}
              className={`flex min-h-[260px] flex-col gap-3.5 rounded-panel p-6 transition-[background,transform,box-shadow] duration-200 ease-out sm:p-9 ${
                isActive
                  ? "-translate-y-3 bg-tile-customers text-on-tile shadow-[0_18px_40px_rgba(26,22,51,.12)]"
                  : "bg-transparent text-primary"
              }`}
            >
              <span
                className={`text-[44px] font-light leading-none tracking-[-0.04em] ${
                  isActive ? "text-[var(--violet-600)]" : "text-accent"
                }`}
              >
                {s.n}
              </span>
              <span className="mt-auto text-xl font-medium leading-[1.25] tracking-[-0.01em]">
                {s.t}
              </span>
              <span className={`text-[15px] leading-[1.55] text-balance ${isActive ? "text-tile-customers-ink" : "text-secondary"}`}>
                {s.d}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" data-screen-label="Pricing" className="bg-canvas px-0 py-16 sm:py-24">
      <div className="grid items-center gap-10 sm:gap-16 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium tracking-[0.08em] text-secondary">PRICING</span>
          <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-primary sm:text-5xl">
            One plan. Cancel whenever.
          </h2>
          <span className="max-w-[440px] text-lg leading-[1.55] text-secondary text-balance">
            Everything included, from your first quest to Growth Mode.
          </span>
        </div>
        <div className="w-full max-w-[520px] rounded-shell bg-card p-2.5 justify-self-end">
          <div className="flex flex-col gap-2 rounded-tile bg-tile-customers p-7 text-on-tile">
            <span className="text-sm font-medium text-tile-customers-ink">Founder</span>
            <span className="text-[64px] font-light leading-none tracking-[-0.04em]">
              $29<span className="text-lg text-tile-customers-ink"> / month</span>
            </span>
          </div>
          <div className="flex flex-col gap-3 px-4.5 pb-4.5 pt-3.5">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-[15px] text-primary">
                <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-tile-level text-xs font-semibold text-on-tile">
                  &#10003;
                </span>
                {perk}
              </div>
            ))}
            <Link
              href="/signup"
              className="mt-2 flex h-[52px] items-center justify-center rounded-full bg-action text-base font-medium text-action-fg transition-colors duration-200 hover:bg-action-hover"
            >
              Start my quest log
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section
      id="faq"
      data-screen-label="FAQ"
      className="flex flex-col items-center gap-7 py-16 sm:py-24"
    >
      <h2 className="text-center text-3xl font-medium leading-[1.15] tracking-[-0.03em] text-primary sm:text-4xl">
        Questions founders ask
      </h2>
      <div className="w-full max-w-[760px] rounded-panel bg-sunken px-4 sm:px-7">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={i > 0 ? "border-t border-subtle" : ""}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-primary"
              >
                <span>{f.q}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card text-lg text-secondary">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p className="mb-5 max-w-[600px] text-[15px] leading-[1.55] text-secondary text-balance">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section data-screen-label="Final CTA" className="py-6 pb-12 sm:pb-24">
      <div className="flex flex-col items-center gap-6 rounded-shell bg-sunken px-8 py-12 text-center sm:py-24">
        <h2 className="max-w-[760px] text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-primary sm:text-6xl">
          Customer number one is closer than you think.
        </h2>
        <Link
          href="/signup"
          className="inline-flex h-[52px] items-center gap-3 rounded-full bg-action py-0 pl-6 pr-2 text-base font-medium text-action-fg transition-colors duration-200 hover:bg-action-hover"
        >
          Start my quest log
          <span className="grid h-9 w-9 place-items-center rounded-full bg-tile-level text-on-tile">
            &rarr;
          </span>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle py-6 pb-10 text-[13px] text-secondary">
      <span>&copy; 2026 Get100-Customers</span>
      <div className="flex gap-4.5">
        <span className="text-secondary">Privacy</span>
        <span className="text-secondary">Terms</span>
        <Link href="/login" className="text-secondary hover:text-primary">
          Log in
        </Link>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-card text-primary">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex min-h-[100svh] flex-col pb-6">
          <Nav />
          <Hero />
        </div>
        <ProductShowcase />
        <Band />
        <HowItWorks />
      </div>
      <Pricing />
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Faq />
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}
