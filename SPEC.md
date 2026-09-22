# Get100-Customers — Project Spec

## 1. Overview

An AI growth coach that helps startup founders acquire their first 100 customers. It is its own standalone platform (conceptually similar in spirit to the AI Engineer Bootcamp / GTM Engineer Bootcamp, but not delivered as part of either), giving each founder a personalized, proactive plan based on their specific company/idea — and it should **feel like a game**, not a chatbot.

- **Core promise:** get the founder from 0 → 100 customers.
- **Interaction model:** AI coach analyzes the founder's business, then proactively assigns quests/actions. The founder executes in the real world and self-reports progress. The AI does not take actions on the founder's behalf (no auto-sending emails, no auto-posting) — coaching only.
- **Tone:** game-like — quests, XP, levels, progress — not a conversational chatbot UI.

## 2. Target user

Early-stage startup founders who have an idea or early product but few or no customers yet. Assume solo or small-team founders, non-technical-marketing background, need structure and accountability more than raw information.

## 3. Business model

- **Subscription (SaaS)** — sold as its own standalone product, independent of any bootcamp.
- Plan tiers (draft, TBD with client): single tier for MVP is fine — expand to tiers (e.g. limited quests vs. unlimited coaching depth) post-MVP.

## 4. Core loop

1. **Onboarding** — founder tells the AI about their company/idea.
2. **AI generates a personalized plan** — a sequence of quests targeting their specific business/customer type.
3. **Founder completes quests in real life** (outreach, content, calls, etc.) and self-reports completion/results in the app.
4. **XP + progress bar update** — visible movement toward the "100 customers" goal.
5. **AI adapts the plan** based on what's working/not working, and proactively nudges the founder with the next quest.
6. Repeat until 100 customers (or ongoing, if the founder continues past 100).

## 5. Onboarding & personalization

Goal: give the AI enough signal to generate a genuinely personalized plan, without a heavy setup burden.

MVP onboarding combines three input methods (all included, since they compose well on the chosen stack):

1. **Structured form** — industry, one-line product description, target customer/ICP, current stage (idea/prototype/launched), channels already tried, current customer count.
2. **Conversational wizard** — the same fields collected as a short guided flow (framed as a game "character creation" step), so it doesn't feel like a survey. This can be the actual UI for #1 (form fields presented conversationally, one at a time) rather than a separate system — avoids building two onboarding paths.
3. **Optional doc/URL upload** — founder can paste a website URL or upload a pitch deck/notes; AI extracts additional context (product description, positioning) to pre-fill or enrich the structured data.

Output of onboarding: a stored **founder profile** (structured fields) that all quest-generation prompts are grounded in.

## 6. Gamification design (MVP-scoped for build simplicity)

Chosen for MVP because it requires only a single state model (points, streak, level) and no map/graph rendering, leaderboard infra, or milestone-event system:

- **XP & Levels:** completing quests earns XP; XP accumulates to level up. Levels are cosmetic/motivational (e.g. "Founder Level 3") — no gating of features behind levels in MVP.
- **Quests:** AI-generated, personalized action items (e.g. "Talk to 5 potential customers this week", "Post about your product in 2 relevant communities"). Each quest has: title, description, XP value, status (active/complete/skipped), due/suggested timeframe.
- **Progress bar:** a single, prominent bar showing customers acquired out of 100 (e.g. "23 / 100"). This is the primary "game state" the whole UI centers on.
- **Streaks:** lightweight day-over-day or week-over-week engagement streak (did the founder complete at least one quest this period). Simple to derive from quest-completion timestamps — no separate system needed.

**Explicitly deferred to a later phase** (flagged as stretch, not MVP):
- Visual journey/map (0→100 as a game-world path with unlockable stages)
- Badges/achievements
- Leaderboards (competitive/social)
- "Boss battle" milestone events (e.g. first paying customer as a special encounter)

## 7. Progress tracking ("how do we know a customer was acquired")

- **MVP: manual self-report.** Founder marks a quest or a standalone action as resulting in a new customer; this increments their customer count and awards XP.
- No verification/evidence requirement and no third-party integration (e.g. Stripe) in MVP — keeps scope small and matches "coach only" automation level.
- **Deferred:** evidence upload (screenshot/proof) for credibility; integration-based tracking (Stripe, CRM) for accuracy. Both noted as open follow-ups if the client wants stronger data integrity later.

## 8. AI coaching engine (functional behavior)

- Takes the founder profile (from onboarding) + running history (completed quests, self-reported outcomes, current customer count) as context.
- Generates the next batch of quests, personalized to the founder's stage, industry, and what has/hasn't worked so far.
- Proactively surfaces the next quest without requiring the founder to ask (this is the "proactive coaching" behavior distinct from a chatbot) — e.g. shown on dashboard login, or via a lightweight notification.
- Adapts over time: if a quest type consistently goes unreported/skipped, deprioritize similar quests; if a channel is working (leads to reported customers), generate more quests in that direction.
- **Out of scope for MVP:** the AI does not call external APIs to execute actions on the founder's behalf (no sending real emails/DMs, no posting to social on their behalf).

## 9. Tech stack

- **Frontend:** Next.js (React)
- **Backend/data/auth:** Supabase (Postgres, Auth, Storage for uploaded docs)
- **AI:** LLM calls (model TBD) for onboarding extraction and quest generation, server-side (Next.js API routes / Supabase Edge Functions)
- **Hosting:** Vercel (Next.js) + Supabase managed backend (assumption — confirm with client if there's a preferred host)

## 10. Data model (draft)

- `founders` — id, auth user id, name, company name, industry, product description, ICP/target customer, stage, channels tried, current customer count, level, xp, streak count, created_at
- `founder_documents` — id, founder_id, type (url/upload), source (url or storage path), extracted_summary
- `quests` — id, founder_id, title, description, xp_value, status (active/complete/skipped), suggested_channel/category, created_at, completed_at
- `customer_events` — id, founder_id, quest_id (nullable), reported_at, note (self-reported outcome description)
- `subscriptions` — id, founder_id, plan, status, billing provider ref

## 11. Non-functional requirements

- Founder-facing UI should read as a game dashboard (progress bar, quest cards, XP/level indicator) as the primary surface — not a chat window.
- Personalization must feel grounded in the specific business, not generic advice — quest text should reference the founder's product/ICP where possible.
- Reasonable AI response latency for quest generation (target: dashboard loads instantly, quest generation can be async/background if needed).

## 12. Success metrics (draft — confirm with client)

- % of founders who reach 100 self-reported customers
- Weekly active founders / quest-completion rate
- Streak retention (week-over-week engagement)
- Subscription retention/churn

## 13. Open questions for client

- Subscription pricing/tiers — single tier or multiple?
- Confirm hosting preference (Vercel/Supabase assumed).
- Any requirement to eventually verify self-reported customers (evidence, integrations) for credibility, or is trust-based self-report acceptable long-term?
- Does the platform need its own brand identity/name (separate from the bootcamps), or is there an existing design system to build the "game" visual style around?
- Which LLM provider/model for the coaching engine (cost/quality tradeoff)?

## 14. MVP scope summary

**In:**
- Structured + conversational + doc/URL onboarding → founder profile
- AI-generated personalized quests
- Quest list UI with complete/skip
- XP, level, streak, 0–100 progress bar
- Manual self-report of new customers
- Subscription paywall (single tier)

**Out (phase 2+):**
- Visual map/journey, badges, leaderboards, boss-battle milestones
- Evidence-based or integration-based customer verification
- AI taking real-world actions on the founder's behalf
- Multiple subscription tiers
