# Get100-Customers

An AI growth coach that helps startup founders acquire their first 100 customers — gamified (quests, XP, levels, progress), not a chatbot.

- **Product spec:** [SPEC.md](./SPEC.md)
- **Build plan (zero-budget, phased):** [PHASES.md](./PHASES.md)
- **Manual setup checklist (do this first):** [SETUP.md](./SETUP.md)
- **Discovery/reference docs:** [docs/](./docs)

## Stack

Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres/Auth/Storage) + Gemini API. See SPEC.md §18.

## Getting started

See [SETUP.md](./SETUP.md) for the full walkthrough (Supabase project, Gemini key, Resend, Stripe test mode, GitHub Actions secrets). Short version once everything's in `.env.local`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

`supabase/schema.sql` holds the full schema (SPEC.md §19), including starter Row Level Security policies. `supabase/seed.sql` seeds the starter quest template library (SPEC §7.1). Run both against a Supabase project's SQL editor, or via the Supabase CLI, once a project exists (PHASES.md Phase 1/3).

## Known limitations

- **Outbound email doesn't reach real users yet.** Resend's free tier, without a verified sending domain, only allows delivery to the address that owns the Resend account itself — every other recipient gets rejected with a 403 (`"You can only send testing emails to your own email address"`). Since every in-app email (milestones, quest check-ins, weekly recap, etc.) is addressed to the *founder's* email, not the Resend account owner's, none of it currently reaches anyone. `src/lib/email/resend.ts` now logs this rejection instead of swallowing it silently, but fixing it for real requires buying a domain, verifying it in Resend (Domains → Add Domain, add the DNS records it gives you), and pointing `RESEND_FROM_EMAIL` at an address on that domain. Deliberately deferred — no domain owned yet.

## AI quality checks

`npm run golden-set` runs the sample founder profiles in `scripts/golden-set-check.ts` against the live Gemini API and prints the personalized/generated quest output for manual review (SPEC §17). Needs a real `GEMINI_API_KEY` in `.env.local` — not run in CI. Re-run it after touching any prompt in `src/lib/ai/` or `supabase/seed.sql`.

## Design system

The UI implements a designer's "Coach Violet + Lime" handoff (tokens + component reference + a static prototype) — see PHASES.md Phase 13. Tokens live in `src/app/tokens/` (colors, typography, spacing) and feed Tailwind v4's `@theme inline` block in `src/app/globals.css`; there's no manual dark-mode toggle, just `prefers-color-scheme` (override with `data-theme="light"|"dark"` on `<html>` for QA). Shared components live in `src/components/ui/`.

## Project layout

```
src/app/                Next.js routes (App Router)
src/app/tokens/         Design tokens (colors, typography, spacing) — see "Design system" above
src/components/ui/      Shared design-system components (actions, forms, surfaces, game, navigation, data)
src/lib/supabase/       Supabase client factories (browser + server)
src/lib/ai/             Gemini client + prompts (tiered model strategy, SPEC §15)
src/lib/quests/         Rule-based selection + AI-personalized quest lifecycle (SPEC §7)
src/lib/growth-profile/ Growth profile aggregation (SPEC §9)
src/types/               Hand-written types mirroring supabase/schema.sql
supabase/schema.sql     Full database schema + RLS policies
supabase/seed.sql       Starter quest template library
scripts/                Manual dev tools (golden-set AI quality check)
```
