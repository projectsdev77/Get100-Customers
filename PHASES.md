# Get100-Customers — Implementation Phases

**Status: Phases 0–11 are code-complete and pushed** (verified via lint/typecheck/build against placeholder env vars — none of it has run against a live backend yet). Phase 12 is the manual pre-launch step. See [SETUP.md](./SETUP.md) for the checklist to get everything actually running and tested.

Built against SPEC.md, sequenced for a **zero-budget build**: every phase uses only free tiers / no-cost tools until explicitly noted. Each phase lists what's built, what it costs (should always be $0 during build), and a **"Swap for launch"** note — the paid replacement the client should make before real users hit it. All swap notes are also rolled up in §0 as a single table for the client to review.

Rule of thumb used throughout: **build and test on free tiers now, budget line items only get spent right before they'd actually be needed** (real user traffic, real email volume, real LLM cost at scale, going live on payments).

## 0. Free → Paid swap log (client-facing summary)

| Area | Free choice (build phase) | Paid swap (launch trigger) | Why |
|---|---|---|---|
| Hosting | Vercel Hobby (free) | Vercel Pro (~$20/mo) | Hobby tier's terms are non-commercial; also raises function execution/bandwidth limits |
| Database/Auth/Storage | Supabase Free tier | Supabase Pro (~$25/mo) | Free tier pauses projects after 1 week idle, no daily backups, 500MB DB / 1GB storage caps |
| LLM (AI coaching engine) | Gemini API free tier (Google AI Studio) during dev — confirmed provider per SPEC §18/docs/10 | Gemini API paid tier at production rate limits/quotas | Free tier is rate-limited (requests/day caps) — fine for building/testing prompts, not for real concurrent founders |
| Transactional email | Resend free tier (3,000 emails/mo) | Resend paid tier or equivalent | Free tier volume caps out once notification volume grows |
| Payments | Stripe test mode (free) | Stripe live mode (no upfront cost, just requires business verification) | Not a budget cost, but a required launch step — flagged so it isn't missed |
| Domain | Vercel's free `*.vercel.app` subdomain | Custom domain (~$10–15/yr) | Needed for a professional/trustworthy launch |
| Error/monitoring | None / console logs during build | Sentry free tier first, paid tier if volume needs it | Sentry has a usable free tier — not a $0→$$ gap, but worth adding before launch |

Nothing above blocks development — it only blocks **scale and commercial launch**. The plan below is sequenced so the team never has to pay to keep building.

## Phase 0 — Repo & environment scaffold

**Goal:** a running local skeleton, zero external accounts required yet.

- Next.js app scaffold (App Router), TypeScript, base folder structure matching SPEC.md's data model
- `supabase/schema.sql` — full schema from SPEC.md §19, ready to run once a free Supabase project exists
- `.env.example` listing every key the app will need (Supabase URL/anon key, LLM API key, Resend key, Stripe keys) — nothing live yet
- Basic CI (lint/typecheck) — free on GitHub Actions public runners

**Cost:** $0. **Blocked on client:** none — this phase needs no accounts.

**Status:** ✅ Code built and pushed. Lint/typecheck/build verified clean.

## Phase 1 — Auth & founder profile (SPEC §5, §19 `founders`)

**Goal:** a founder can sign up, log in, and have a profile row.

- Wire real Supabase project (free tier) for Auth + Postgres
- `founders` table live; signup/login flow
- Founder profile fields as editable settings (not onboarding UI yet — just CRUD)

**Cost:** $0 (Supabase free tier). **Blocked on client:** a free Supabase account/project (takes 2 minutes, no card required).

**Status:** ⚠️ Code built and pushed (auth, session proxy, profile CRUD, auto-provisioning trigger). Verified via lint/typecheck/build against placeholder env vars — **not yet tested against a live Supabase project**, since none exists yet. Needs your Supabase URL/keys to actually verify signup/login end-to-end.

## Phase 2 — Conversational onboarding (SPEC §5)

**Goal:** the "character creation" flow that populates the founder profile, plus optional doc/URL upload.

- One-field-at-a-time onboarding UI
- URL fetch + doc upload to Supabase Storage (free tier)
- AI extraction from doc/URL into profile fields — first point the app needs an LLM key

**Cost:** $0 on the Gemini API free tier (see §0). **Blocked on client:** a free Google AI Studio API key (no card required); swapped for a paid-tier key at launch (Phase 12).

**Status:** ⚠️ Code built and pushed (step-by-step wizard, URL/text-file analysis, Gemini extraction, storage upload). Verified via lint/typecheck/build against placeholder env vars — **not yet tested against a live Supabase project or a real Gemini key**. PDF/DOCX upload parsing is intentionally out of scope for now (only .txt/.md); noted inline in code as a fast-follow.

## Phase 3 — Quest template library + rule-based quest engine (SPEC §7)

**Goal:** the quest loop working end-to-end **before** adding AI personalization cost — quests picked from a hand-written template library, filtered by simple rules (industry/stage/channel), not yet AI-adapted.

- `quest_templates` seeded with a real starter set (content is free to write)
- Quest lifecycle (`suggested → active → awaiting_report → completed/skipped/expired`)
- Quest journal UI, up to 3 concurrent quests, "show other options" / "not for me"

**Status:** ⚠️ Code built and pushed — `supabase/seed.sql` (12 starter templates across all 6 channels), rule-based `pickTemplate` selection (stage filter + prefer untried channels), lazy expiry, auto-refill up to 3 concurrent slots, and the full accept/skip/regenerate/mark-done action set with a quest log + journal UI. Verified via lint/typecheck/build against placeholder env vars — **not yet tested against a live Supabase project** (needs schema.sql + seed.sql actually run). `awaiting_report` is a dead end until Phase 4 exists — expected, not a bug.

**Cost:** $0 — no AI calls yet, pure logic + seeded content. **Rationale for sequencing:** proves the core loop and UI before spending any LLM budget on personalization.

## Phase 4 — Result logging & growth profile (SPEC §8, §9)

**Goal:** structured result questions per quest, feeding the growth profile.

- `quest_results` capture (structured answers + notes)
- `growth_profiles` aggregation logic (channels_tried, what_working/not_working) — starts as straightforward aggregation, not AI-derived yet
- Manual customer self-report + correction (`customer_events`)

**Status:** ⚠️ Code built and pushed — result-question form (typed per SPEC §7.2 question types) on `awaiting_report` quests, `submitQuestResult` completing the quest and, on a true `converted` answer, auto-logging a `customer_events` row + incrementing the founder's count (the "converted" checkbox *is* the manual self-report, SPEC §8). `recomputeGrowthProfile` aggregates channel conversion rates + a simple bottleneck heuristic (non-AI, per plan) after every result. Dashboard also gets standalone "+1 customer" and "correct count" controls (SPEC §14 churn/correction handling). Verified via lint/typecheck/build — **not yet tested live**.

**Cost:** $0 — still no new AI dependency; free-text summarization can stay a stub/raw-notes-passthrough until Phase 5.

## Phase 5 — AI personalization layer (SPEC §7.1, §9)

**Goal:** turn the rule-based engine from Phase 3 into the real hybrid template+AI system, and add AI summarization of free-text results.

- LLM adapts selected templates using founder profile + growth profile
- Net-new quest generation when no template fits
- Free-text result summarization into growth-profile insights
- Guardrails + golden-set checks from SPEC §17 introduced here, since this is where AI output quality first matters

**Cost:** $0 on the Gemini free tier during build; this is the phase most sensitive to the LLM swap in §0 before real launch (quality and rate limits both matter here).

**Status:** ⚠️ Code built and pushed — `personalizeQuestWithAI` (fast tier) fills a picked template's placeholders from founder+growth context with a no-leftover-`{{}}` guardrail, falling back to the raw template on any failure; `generateNetNewQuest` (capable tier) covers the no-template-fits case with its own guardrails (required `converted` boolean, sane XP/window bounds); `summarizeResultNotes` (fast tier) fills `quest_results.ai_summary`, which `recomputeGrowthProfile` now surfaces as evidence instead of the bare conversion-rate string. `scripts/golden-set-check.ts` + `npm run golden-set` is the manual SPEC §17 QA tool (3 founder archetypes, not run in CI — needs a real key). Verified via lint/typecheck/build against placeholder env vars — **the AI calls themselves are unexercised until a real `GEMINI_API_KEY` exists**; run `npm run golden-set` first thing once you have one.

## Phase 6 — Gamification UI (SPEC §6)

**Goal:** XP, levels, streak, 0–100 progress bar, made visually the primary surface.

- Pure frontend/backend logic on top of existing data — no new external dependency
- This is where the product stops looking like a form/dashboard and starts feeling like the game the client asked for

**Cost:** $0.

**Status:** ⚠️ Code built and pushed — `computeLevel`/`xpIntoCurrentLevel` (100 XP/level, cosmetic only) and `computeNextStreak` (day-based, 7-day reset window, no XP/level clawback) are pure functions wired into `submitQuestResult`'s single batched founders update. Dashboard's `GrowthHud` replaces the plain-text progress line with an actual customer progress bar, level badge + XP bar, and streak line — this is the primary game-state surface SPEC §6 calls for. Verified via lint/typecheck/build — **not yet tested live**, and the streak/leveling math itself has no live data to exercise yet.

## Phase 7 — Chat interface (SPEC §10)

**Goal:** secondary, context-aware chat surface.

- Reuses the Phase 5 LLM integration with full context (profile, growth profile, quest history)
- Propose-only actions (quest swap suggestions), no autonomous execution

**Cost:** $0 on the same Gemini free tier as Phase 5.

**Status:** ⚠️ Code built and pushed — `ChatWidget` is a bottom-right bubble/panel (not persisted server-side; history lives for the tab session), mounted in the `(app)` layout so it's available everywhere except onboarding. `sendChatMessage` (capable tier) gets full context — founder profile, growth profile, and current occupying quests by id/title/status — via `systemInstruction`, and can only *propose* a quest swap (never execute); a proposed id is validated server-side against the founder's actual quest list before the UI's confirm button will even show (guards against a hallucinated id). Confirming calls the same skip → refill path Phase 3's "not for me" uses. Verified via lint/typecheck/build — **unexercised until a real `GEMINI_API_KEY` and Supabase project exist**.

## Phase 8 — Notifications (SPEC §11)

**Goal:** in-app + email notifications for the core triggers.

- In-app notifications: free, internal
- Email: Resend free tier (3,000/mo) — plenty for build/test volume
- Triggers: new quest, window approaching, re-engagement, milestones, weekly recap

**Cost:** $0 (Resend free tier). **Blocked on client:** a free Resend account + a sending domain (can start on Resend's free onboarding domain for testing).

**Status:** ⚠️ Code built and pushed. `notify()` is the single entry point — always logs in-app, additionally emails via Resend (fetch-based, no SDK dependency) unless the founder's `email_notification_prefs` has that type off, using a new service-role admin client (`src/lib/supabase/admin.ts`) since notification writes and the Auth admin email lookup are system-generated, not founder-session writes. `new_quest` fires from `ensureQuestSlots`; `milestone` (level-up and 10/25/50/100 customer thresholds) fires from `submitQuestResult` and the dashboard's manual customer actions; `window_approaching`/`re_engagement` have no natural event to hook, so they're lazily checked (deduped via `hasRecentNotification`) inside `refreshQuestLog`, now also called from the dashboard, not just `/quests`. `weekly_recap` runs from a bearer-secret-protected route (`/api/cron/weekly-recap`) triggered by a **scheduled GitHub Actions workflow** (`.github/workflows/weekly-recap.yml`) — real zero-budget cron, since GitHub Actions scheduled workflows are free within the monthly minutes allowance and Vercel Hobby's free cron tier is more limited. Settings gained an email-preferences toggle section; nav gained an unread-count "Notifications" link to a full list page with mark-all-read.

**Blocked on client (additional):** two GitHub repo secrets for the cron workflow — `APP_URL` (the deployed app's base URL) and `CRON_SECRET` (must match the `CRON_SECRET` env var on the deployment, set in `.env.example`).

## Phase 9 — Admin dashboard (SPEC §12)

**Goal:** minimum internal tooling for support/debugging.

- Founder list + status, manual overrides, read-only growth-profile view
- Internal-only route, gated by `admin_users`

**Cost:** $0.

**Status:** ⚠️ Code built and pushed — found `admin_users` had **no RLS enabled at all** (any authenticated user could've read it over the REST API and enumerated admin ids); fixed with a self-select-only policy before building anything on top of it. `/admin` is gated once in `src/app/admin/layout.tsx` via `isCurrentUserAdmin` (checked through the founder's own RLS-scoped session); everything under it then uses the service-role admin client for cross-founder reads, since normal RLS stays scoped to `auth.uid()` regardless of admin status. Founder list (`/admin`) shows stage/customers/level/subscription; founder detail (`/admin/founders/[id]`) adds profile, read-only growth profile, and two support overrides (customer-count correction, subscription status) via `adminCorrectCustomerCount`/`adminUpdateSubscriptionStatus`. Verified via lint/typecheck/build — **not yet tested live**, and no `admin_users` row exists yet for anyone (see final setup checklist for how to add one).

## Phase 10 — Subscriptions & billing (SPEC §3)

**Goal:** trial + subscription + grace-period dunning, fully working in test mode.

- Stripe integration built entirely against **test mode** (free, no business verification needed to build/test)
- Trial logic, restricted-mode on payment failure, grace period
- Going **live** (real charges) only requires flipping to live API keys + Stripe business verification — not a budget cost, just a pre-launch step, captured in §0

**Cost:** $0 to build and fully test. Real cost only appears as Stripe's per-transaction fee once live, which is revenue-linked, not upfront budget.

**Status:** ⚠️ Code built and pushed — signup's provisioning trigger now also creates a `trialing` subscription with a 14-day `trial_ends_at` (SPEC §3 assumption). `applySubscriptionLifecycle` (admin client only — there is deliberately no client-writable RLS policy for subscription status) lazily flips `trialing`→`restricted` past trial end and `past_due`→`restricted` past a 7-day `grace_period_ends_at`, called from `refreshQuestLog` alongside the other lazy checks. Restricted accounts are gated at the point of use rather than blocked from viewing anything: `ensureQuestSlots` stops generating new quests, and chat's `sendMessage` returns a "please update your payment method" reply instead of calling Gemini — history/progress stay fully viewable, matching SPEC §3's "read-only, not locked out." `/billing` (Stripe Checkout via server-side redirect, no publishable key/Stripe.js needed) and `/api/webhooks/stripe` (checkout completed, subscription updated/deleted, payment failed/succeeded) are both built entirely against test mode. Verified via lint/typecheck/build — **not yet tested live**, and needs real Stripe test-mode keys plus a webhook pointed at the deployed URL (or `stripe listen` locally) to exercise.

## Phase 11 — Growth Mode, edge cases, hardening (SPEC §14)

**Goal:** the long-tail correctness work — 100+ at signup, pivot handling, churn correction, disagreement handling, privacy baseline (export/delete), QA guardrails tightened.

**Cost:** $0.

**Status:** ⚠️ Code built and pushed. Also caught and fixed a real bug while here: `recomputeGrowthProfile`'s upsert was writing through the founder's session-scoped client, but `growth_profiles` only ever had a SELECT RLS policy — that write would have silently no-opped against a live database, quietly breaking the "adapts based on results" feature from Phase 4/5 onward. Now routed through the admin client, same as the other system-derived tables.

- **Growth Mode (100+):** `getProgressTarget`/`isInGrowthMode` give stretch targets (100→250→500→1000→+500), wired into `GrowthHud` so the dashboard automatically shows "Growth Mode — next target" once `current_customer_count` crosses 100 — this also covers "100+ at signup" (SPEC §14) since it's the same display logic regardless of how the count got there. The 100-customer milestone notification is special-cased to announce Growth Mode entry.
- **Churn correction:** a downward `correctCustomerCount` now calls `flagChurnEvent`, appending a `strategy_history` entry so future coaching sees it instead of silently ignoring it.
- **Pivot handling:** `updateProfile` compares industry/product description before and after; a material change appends a `strategy_history` entry and returns `pivotDetected`, which `ProfileForm` surfaces as a dismissible "revisit onboarding?" suggestion — non-blocking, and XP/level/customer count are untouched (both churn and pivot flagging share one `appendStrategyHistory` helper).
- **Disagreement handling:** already covered by Phase 3's skip-with-reason — no new code needed, just confirmed against SPEC §14 here.
- **Privacy baseline:** `/api/account/export` streams a founder's full data as a downloadable JSON file (session-scoped, no admin client needed — every table has a founder-scoped SELECT policy). Account deletion (`deleteAccount`, gated behind typing "DELETE") calls `auth.admin.deleteUser`, which cascades through every founder-owned table via the `on delete cascade` foreign keys already in the schema.
- **QA guardrails:** reaffirmed rather than expanded — Phase 5/7's guardrails (no leftover `{{}}`, non-empty checks, hallucination-proof id validation for chat swaps) already cover the AI surfaces; no new gaps found worth adding contrived checks for.

Verified via lint/typecheck/build — **not yet tested live**.

## Phase 12 — Pre-launch swap (the one paid phase)

**Goal:** execute the §0 swap table for real — this is the only phase that costs money, and only once the product is ready for real users.

1. Vercel → Pro
2. Supabase → Pro
3. Gemini API dev key → production-tier Gemini API key (higher quota, billing enabled)
4. Resend → paid tier if volume requires it
5. Custom domain purchase
6. Stripe → live mode
7. (Optional) Sentry paid tier if free tier volume is exceeded

## Phase 13 — Design system integration ("Coach Violet + Lime" handoff)

**Goal:** implement the UI/UX designer's handoff (design tokens, component library, and a static prototype) into the actual app, in place of the plain black/white/zinc styling Phases 0–11 shipped with. Zero-budget throughout — no new paid services.

Done one surface at a time, verified with `tsc`/`lint`/`build` plus a local Playwright screenshot pass (light + dark) before each commit:

1. Design tokens (colors/typography/spacing) wired into `src/app/globals.css` via Tailwind v4's `@theme inline`; Hanken Grotesk swapped in for Geist Sans via `next/font/google` (Geist Mono kept for tabular/mono data).
2. Shared component library under `src/components/ui/` (actions, forms, surfaces, game, navigation, quests, data) reimplementing the handoff's reference components as Tailwind utilities on the same tokens, not the reference inline styles.
3. Auth pages, onboarding wizard (+ `weekly_hours` field and a review step), app shell (`TopNav`, restricted-account banner), dashboard (`GrowthHud` with conic-gradient progress rings and a stepped Growth Mode target ladder), quests page (`QuestCard`/`JournalRow`, reordered sections, "Why this?" reasoning, the 3-active-quest cap's flash message), notifications, settings (business profile now editable including `weekly_hours`, notification prefs, danger zone), billing (plan tile, portal deep-links, real Stripe invoice history), admin (generic `Table` component, company/email search), chat widget (restricted paused state, "Keep it" alongside "Swap this quest"), and the landing page — all restyled to match.
4. A few gaps between the handoff and the existing build (quest capacity model, onboarding fields, "why this?" reasoning storage, stage enum) were resolved with the client rather than guessed — see git history on `claude/dazzling-heisenberg-h65viq` for the specific questions and answers.

Two schema/prompt additions came out of the handoff's gap resolution rather than the original Phases 3–4: a `weekly_hours` column (feeds quest sizing and is now editable in Settings, not just onboarding) and a `reasoning` column on `quests` (the AI- or template-generated "why this?" sentence). Everything else in this phase is UI-only, plus the billing invoice history and admin search additions the handoff's prototype called for.

## Fast-follow (post-launch, per SPEC §23)

Visual journey/map, badges, leaderboards, boss-battle milestones, evidence/integration-based customer verification, standalone template library, multiple subscription tiers, full BI tooling — unchanged from SPEC §23, sequenced after Phase 12 based on real usage data.

---

### What I need from you to keep moving

Phase 0 needs no accounts and I can start now. Phase 1 onward needs, when you're ready:
- A free Supabase project (URL + anon/service keys)
- A free Google AI Studio API key for Gemini (Phase 2)
- Later: a free Resend account (Phase 8), a Stripe test-mode account (Phase 10, also free)

I'll start Phase 0 now.
