# Get100-Customers — Project Spec

> This spec designs the **complete product**. Not every section ships on day one — items are tagged `[Launch]` or `[Fast-follow]` so implementation can still proceed in order. Sections marked `[ASSUMPTION — confirm]` are business calls made with a reasonable default because no client input exists yet; everything else is either previously confirmed or a defaulted implementation detail the team can override on review.

## 1. Overview

An AI growth coach that helps startup founders acquire their first 100 customers. It is its own standalone platform (conceptually similar in spirit to the AI Engineer Bootcamp / GTM Engineer Bootcamp, but not delivered as part of either), giving each founder a personalized, proactive plan based on their specific company/idea — and it should **feel like a game**, not a chatbot.

- **Core promise:** get the founder from 0 → 100 customers, then keep coaching growth beyond that.
- **Interaction model:** AI coach analyzes the founder's business, then proactively assigns quests/actions. The founder executes in the real world and self-reports progress. The AI does not take actions on the founder's behalf (no auto-sending emails, no auto-posting) — coaching only.
- **Tone:** game-like — quests, XP, levels, progress — with a secondary chat surface for Q&A, not a conversational chatbot UI as the primary experience.

## 2. Target user

Early-stage startup founders who have an idea or early product but few or no customers yet. Assume solo or small-team founders, non-technical-marketing background, need structure and accountability more than raw information.

## 3. Business model

- **Subscription (SaaS)** — sold as its own standalone product, independent of any bootcamp.
- Single tier at launch; expand to tiers (e.g. limited quests vs. unlimited coaching depth) post-launch. `[Launch: single tier]` `[Fast-follow: tiers]`
- **Trial strategy `[ASSUMPTION — confirm]`:** 14-day free trial, no credit card required to start onboarding, card required to continue past day 14. Chosen as a standard, low-friction SaaS default — confirm against actual pricing strategy.
- **Payment failure handling:** on failed renewal, 7-day grace period with in-app + email dunning notices. After grace period, account moves to **restricted mode** (founder can view their history/progress read-only, but cannot receive new quests or use chat) until payment is resolved. No data is deleted for non-payment.

## 4. Core loop

1. **Onboarding** — founder tells the AI about their company/idea (§5).
2. **AI generates a personalized plan** — a small active quest log, not a giant backlog (§6, §7).
3. **Founder completes quests in real life** and self-reports outcomes via structured result questions (§8).
4. **Growth profile updates** — the system's evolving model of what's working for this founder (§9).
5. **XP + progress bar update** — visible movement toward the "100 customers" goal (§6).
6. **AI adapts the plan** and proactively surfaces the next quest (§7, §11).
7. Repeat past 100 customers into open-ended **Growth Mode** (§14).

## 5. Onboarding & personalization

MVP-of-complete-product onboarding combines three input methods:

1. **Structured form** (presented as a conversational, one-field-at-a-time "character creation" flow rather than a raw form) — industry, one-line product description, target customer/ICP, current stage (idea/prototype/launched), channels already tried, current customer count.
2. **Optional doc/URL upload** — website URL or pitch deck/notes upload; AI extracts additional context to pre-fill or enrich the structured fields.
3. **Founder profile is editable anytime** post-onboarding (in settings) — this is not a one-time snapshot.

### Context drift over time `[Fast-follow]`

The static founder profile can go stale as the business evolves. Two mechanisms:
- **Manual edits** are always available and always respected immediately.
- **Passive drift detection:** if self-reported quest outcomes repeatedly contradict profile assumptions (e.g. a channel the profile says is untried keeps appearing in results, or customer growth stalls for an extended period), the AI surfaces a lightweight check-in prompt: *"Has anything changed about your business or target customer?"* This does not block usage — it's a suggestion, dismissible.
- A **significant profile edit** (industry or product description materially changes) logs an entry to `strategy_history` (§9) and triggers a short re-onboarding check-in, but does **not** reset customer count, XP, or level — those represent the founder's overall journey, not just the current idea framing (see also §14, pivot handling).

## 6. Gamification design

Core loop (kept simple by design — a single state model, no map/graph rendering or leaderboard infra):

- **XP & Levels:** completing quests earns XP; XP accumulates to level up. Levels are cosmetic/motivational — no feature-gating by level at launch.
- **Progress bar:** a single, prominent bar showing customers acquired out of 100 (e.g. "23 / 100"). Primary "game state" the UI centers on.
- **Streaks:** engagement streak based on quest-completion activity, not forced daily logins (pacing is quest-dependent, see §11). Streak resets after a defined inactivity window (7 days) but does not claw back XP or level.
- **Quest journal:** history of completed/skipped quests, visible to the founder (also doubles as an activity log).

`[Fast-follow]` (designed for, not required at launch): visual journey/map, badges/achievements, leaderboards, "boss battle" milestone events. These remain deferred because they need additional rendering/social infrastructure the core loop doesn't; nothing in the data model below blocks adding them later.

## 7. Quest system

### 7.1 Architecture — hybrid generation `[Decision: confirmed]`

Quests are **not** purely freeform AI text nor a static template picker — they're a hybrid:
- A **template library**, categorized by channel (cold email, warm intros, communities, content, paid, partnerships, etc.), industry archetype, and founder stage.
- An **AI personalization layer** that selects/adapts the best-fit template(s) using the founder profile + growth profile, and can generate a net-new quest when no template fits well.

Rationale: consistent quality and controllable AI cost from the template base, with flexibility from AI adaptation. Also makes QA (§13) tractable — templates can be reviewed once; AI adaptation is checked against guardrails rather than validated from scratch every time.

### 7.2 Quest data model

| Field | Notes |
|---|---|
| `title`, `description` | Personalized to the founder's product/ICP where possible |
| `instructions` | Step-by-step guidance |
| `category` / `channel` | e.g. cold_email, content, community |
| `xp_value` | |
| `tools_provided` | Links to personalized templates/scripts (§8) |
| `result_questions` | 2–4 structured questions shown at completion, type-specific |
| `success_criteria` | What counts as a successful outcome for this quest |
| `sub_tasks` | Optional checklist for multi-step quests |
| `suggested_window` | Soft deadline (e.g. "3–5 days"), not a hard lock |
| `status` | See lifecycle below |

### 7.3 Quest lifecycle

`suggested` → `active` → (optional `in_progress` via sub-tasks) → `awaiting_report` (founder marked done, hasn't answered result questions yet) → `completed`, or → `skipped` (explicit decline, with reason), or → `expired` (soft deadline passed with no action; auto-moves to skipped with `reason=expired`).

Founder has **up to 3 active quests concurrently** (configurable) — the game UI shows a small quest log, not a backlog dump. Completed/skipped quests remain visible in the quest journal.

### 7.4 Recommendation & UX

When a slot opens (quest completed/skipped/expired), the AI recommends **one primary next quest**, chosen using growth-profile signals (reinforce channels that are working, deprioritize repeatedly-skipped quest types, balance "quick win" vs. "big swing" quests for pacing). The founder can:
- Accept it (moves to `active`),
- Tap **"show other options"** to see 2 alternatives, or
- Tap **"not for me"** with an optional reason (too hard / not relevant / already tried / no time) — this is a first-class signal into the growth profile, not just a dismissal.

## 8. Result logging & templates/tools

- When a founder marks a quest done, they answer that quest's structured `result_questions` (e.g. reach count, response count, did it convert) plus an always-available free-text notes field.
- Structured fields are used directly for progress tracking and growth-profile stats; free text is summarized by the AI for qualitative signal (objections heard, what resonated).
- **Templates & tools:** the template library (§7.1) also powers execution aids — outreach email templates, DM scripts, one-liners, landing-page copy frameworks — personalized with the founder's product name, ICP, and tone. These live inside the quest detail view as "Your tools for this quest." `[Launch]` A standalone browsable template library (outside quest context) is `[Fast-follow]`.
- **Customer acquired:** still **manual self-report** at launch (per earlier decision) — founder marks a quest or standalone action as resulting in a new customer, incrementing their count and awarding XP. Evidence upload and integration-based tracking (Stripe/CRM) remain `[Fast-follow]`.
- **Correcting the count:** founder can manually adjust their reported customer count in settings (handles both mistakes and real churn — see §14).

## 9. Growth profile (the AI's "what we've learned" state)

A first-class entity, separate from the static founder profile, that's the primary input (alongside the founder profile) to quest generation and chat context:

| Field | Purpose |
|---|---|
| `channels_tried` | map of channel → {attempts, successes, conversion_rate} |
| `what_working` | AI-derived insights, each with supporting evidence |
| `what_not_working` | same, for underperforming approaches |
| `bottleneck_hypothesis` | AI's current best guess at the biggest blocker (e.g. "messaging isn't resonating" vs. "not enough volume") |
| `strategy_history` | append-only log of major strategy shifts, with rationale and date |
| `last_updated` | |

This updates after every quest result and after significant profile edits, and is what makes AI adaptation ("proactively surfaces the next quest") actually grounded rather than generic.

## 10. AI coach chat interface

Secondary surface, not the primary UI: a persistent chat bubble/icon (not a full-screen chat window), used for questions about the current quest, requesting a quest swap, general growth questions, or "why did you recommend this?" The chat has full context (founder profile, growth profile, quest history) — it is not a blank assistant. Chat can *propose* actions (e.g. "want me to swap this quest for X?") but execution still requires explicit founder confirmation, consistent with the coach-only automation model (no autonomous actions).

## 11. Pacing, re-engagement & notifications

- **Pacing is quest-dependent, not a fixed schedule.** Each quest carries a `suggested_window` (e.g. 1 day for a content quest, 3–5 days for an outreach quest); the next quest is queued as soon as a slot opens, but nudges follow the quest's natural cadence rather than a rigid daily push.
- **Re-engagement:** if a founder has active quests but no activity for 5 days, a re-engagement notification fires ("Your quest is still open — need a hand?").
- **Notification channels:** in-app (always on, core to the game UI) + email (toggleable per category in settings).
- **Triggers:** new quest available, suggested-window approaching, re-engagement after inactivity, milestones (level up, 10/25/50/100 customers, Growth Mode entry), weekly progress recap email.

## 12. Admin tools `[Launch, minimum scope]`

Internal (non-founder-facing) dashboard for:
- List of founders with subscription status and basic usage stats (last active, quests completed, current customer count)
- Manual override of a founder's subscription state or customer count for support purposes
- Read-only view of a founder's growth profile, for support/debugging

Full analytics/BI tooling is `[Fast-follow]`.

## 13. Data privacy `[ASSUMPTION — confirm target geography]`

Baseline regardless of jurisdiction: account data export, account deletion (cascades to profile/quests/growth profile/results), a clear privacy policy, no selling of data, minimal PII collection. **Open question:** is the initial market US-only or does it include EU/UK? That determines whether formal GDPR mechanisms (DPA, explicit consent flows, right-to-be-forgotten SLAs) need to be built for launch vs. treated as fast-follow compliance work.

## 14. Growth Mode & edge cases

- **Reaching 100 customers:** not a hard stop. Triggers a celebration/level-up moment, then the founder transitions into open-ended **Growth Mode** — continued coaching with new stretch goals (e.g. 250, 500) — so subscription value continues past the original goal.
- **Customer count decreasing (churn):** no automated churn tracking at launch (no integrations); founder can manually correct their count in settings. A large downward correction is logged as a flagged event in the growth profile so the AI addresses it in coaching rather than ignoring it.
- **100+ customers at signup:** allowed. Onboarding asks current customer count; if already ≥100, the founder skips the 0→100 framing and starts directly in Growth Mode with a next milestone.
- **Business pivot:** handled by the profile-edit + drift-detection flow in §5 — customer count, XP, and level persist across a pivot (they represent the founder's overall journey), while `strategy_history` records the shift.
- **Disagreeing with recommendations:** always-available "not for me" skip with optional reason (§7.4), plus always-offered alternatives — this is a growth-profile signal, not a dead end.

## 15. Scale, cost & performance `[ASSUMPTION — confirm scale/budget]`

No real budget/scale figures exist yet; defaulting to a standard early-stage SaaS design point: low-thousands of concurrent founders in year one, not massive scale from day one. AI cost is managed via a tiered model strategy on the Gemini API (§18) — a cheaper/faster model (e.g. Gemini Flash tier) for routine quest selection from the template library, a more capable model (e.g. Gemini Pro tier) reserved for onboarding analysis, growth-profile synthesis, and chat; template content is reused/cached rather than regenerated from scratch on every quest. Confirm actual growth targets and paid-tier AI budget with the client — this affects infra sizing and how soon Phase 12's LLM swap (PHASES.md) is needed.

## 16. Analytics

- **Founder-facing:** progress bar, XP/level, streak, and a simple "growth insights" panel surfaced from the growth profile (e.g. *"Your best channel: cold email (3 customers)"*).
- **Internal:** event tracking (quest generated/accepted/completed/skipped, customer reported, subscription events) piped to a basic store — Supabase tables + simple queries at launch; a dedicated BI tool is `[Fast-follow]`.

## 17. AI quality assurance

- A golden-set of sample founder profiles with expected quest quality, checked when prompts/templates change.
- Guardrails on generated content: no fabricated specific facts about the founder's industry; generated quests must map back to founder-profile fields (no generic filler).
- Logged AI outputs for spot-checking.
- If AI generation fails validation, fall back to the template library rather than showing a broken/empty quest.

## 18. Tech stack

- **Frontend:** Next.js (React)
- **Backend/data/auth:** Supabase (Postgres, Auth, Storage for uploaded docs)
- **AI `[Decision: confirmed]`:** Gemini API (tiered model strategy, §15) for onboarding extraction, quest generation/personalization, result summarization, and chat — server-side (Next.js API routes / Supabase Edge Functions). Google AI Studio's free tier is the dev-phase key (PHASES.md); swapped for a paid production key at launch (PHASES.md Phase 12).
- **Hosting `[ASSUMPTION — confirm]`:** Vercel (Next.js) + Supabase managed backend

## 19. Data model

- `founders` — id, auth user id, name, company name, industry, product description, ICP/target customer, stage, channels tried, current customer count, level, xp, streak count, created_at, updated_at
- `founder_documents` — id, founder_id, type (url/upload), source, extracted_summary
- `growth_profiles` — id, founder_id, channels_tried (jsonb), what_working (jsonb), what_not_working (jsonb), bottleneck_hypothesis, strategy_history (jsonb), last_updated
- `quest_templates` — id, category/channel, industry_tags, stage_tags, title_template, instructions_template, default_xp, result_question_set, tool_templates
- `quests` — id, founder_id, template_id (nullable, null = net-new AI-generated), title, description, instructions, category, xp_value, tools_provided (jsonb), result_questions (jsonb), success_criteria, sub_tasks (jsonb), suggested_window, status, created_at, completed_at
- `quest_results` — id, quest_id, founder_id, structured_answers (jsonb), notes, ai_summary, reported_at
- `customer_events` — id, founder_id, quest_id (nullable), event_type (reported/corrected), delta, reported_at, note
- `subscriptions` — id, founder_id, plan, status, trial_ends_at, billing provider ref
- `notifications_log` — id, founder_id, type, channel, sent_at
- `admin_users` — id, auth user id, role

## 20. Non-functional requirements

- Founder-facing UI reads as a game dashboard (progress bar, quest cards, XP/level indicator) as the primary surface, with chat as a secondary, non-blocking surface.
- Personalization must feel grounded in the specific business — quest text and templates reference the founder's actual product/ICP, not generic advice.
- Dashboard loads instantly; quest generation can be async/background if needed.

## 21. Success metrics

- % of founders who reach 100 self-reported customers
- Weekly active founders / quest-completion rate
- Streak retention (week-over-week engagement)
- Subscription retention/churn
- % of founders reaching Growth Mode (100+) who remain subscribed

## 22. Open questions for client (business decisions, not defaulted)

- Confirm pricing/trial numbers (§3 has a placeholder 14-day trial assumption).
- Confirm target launch geography for privacy scope (§13).
- Confirm expected scale and paid-tier AI budget (§15) — affects infra sizing and launch timing.
- Confirm hosting preference (§18 assumes Vercel/Supabase).
- Does the platform need its own brand identity/name, or is there an existing design system to build the "game" visual style around?

**Resolved since first draft:** LLM provider is Gemini API (§18), per docs/10.

## 23. Launch scope summary

**Launch:**
- Structured (conversational) + doc/URL onboarding → editable founder profile
- Hybrid template + AI quest generation, full lifecycle, up to 3 concurrent quests
- Structured result logging → growth profile
- Personalized templates/tools inside quest detail view
- XP, level, streak, 0–100 progress bar, quest journal
- Manual self-report + manual correction of customer count
- Secondary chat interface with full context
- Notifications: in-app + email, core triggers
- Minimum admin dashboard
- Growth Mode past 100, pivot/disagreement/edge-case handling per §14
- Single-tier subscription with trial + grace-period dunning

**Fast-follow:**
- Visual journey/map, badges, leaderboards, boss-battle milestones
- Evidence-based or integration-based (Stripe/CRM) customer verification
- Standalone browsable template library
- Multiple subscription tiers
- Full BI/analytics tooling
- AI taking real-world actions on the founder's behalf (remains explicitly out of scope, not just deferred — see §1 automation model)
