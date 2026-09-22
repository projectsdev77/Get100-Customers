# Get100-Customers

An AI growth coach that helps startup founders acquire their first 100 customers — gamified (quests, XP, levels, progress), not a chatbot.

- **Product spec:** [SPEC.md](./SPEC.md)
- **Build plan (zero-budget, phased):** [PHASES.md](./PHASES.md)
- **Discovery/reference docs:** [docs/](./docs)

## Stack

Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres/Auth/Storage) + Gemini API. See SPEC.md §18.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys — see PHASES.md for which phase needs which
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

`supabase/schema.sql` holds the full schema (SPEC.md §19), including starter Row Level Security policies. `supabase/seed.sql` seeds the starter quest template library (SPEC §7.1). Run both against a Supabase project's SQL editor, or via the Supabase CLI, once a project exists (PHASES.md Phase 1/3).

## AI quality checks

`npm run golden-set` runs the sample founder profiles in `scripts/golden-set-check.ts` against the live Gemini API and prints the personalized/generated quest output for manual review (SPEC §17). Needs a real `GEMINI_API_KEY` in `.env.local` — not run in CI. Re-run it after touching any prompt in `src/lib/ai/` or `supabase/seed.sql`.

## Project layout

```
src/app/                Next.js routes (App Router)
src/lib/supabase/       Supabase client factories (browser + server)
src/lib/ai/             Gemini client + prompts (tiered model strategy, SPEC §15)
src/lib/quests/         Rule-based selection + AI-personalized quest lifecycle (SPEC §7)
src/lib/growth-profile/ Growth profile aggregation (SPEC §9)
src/types/               Hand-written types mirroring supabase/schema.sql
supabase/schema.sql     Full database schema + RLS policies
supabase/seed.sql       Starter quest template library
scripts/                Manual dev tools (golden-set AI quality check)
```
