# Get100-Customers — Manual Setup Checklist

Everything in `PHASES.md` (0–11) is built and pushed to `claude/dazzling-heisenberg-h65viq`, verified via lint/typecheck/build against placeholder env vars. None of it has touched a live backend yet — that's what this checklist gets you to. Work through it top to bottom; later steps depend on earlier ones.

## 1. Supabase (free tier, no card)

1. Create a project at [supabase.com](https://supabase.com).
2. Project Settings → API — copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret — it bypasses RLS)
3. SQL Editor → run the full contents of `supabase/schema.sql`.
4. SQL Editor → run the full contents of `supabase/seed.sql` (seeds the 12 starter quest templates).
5. **Dev-speed tip:** Authentication → Providers → Email → consider turning off "Confirm email" while you're testing locally, so signup doesn't wait on Supabase's rate-limited built-in mailer. Turn it back on (or wire a custom SMTP provider) before real users.

## 2. Google sign-in (optional, free)

"Continue with Google" on `/login` and `/signup` goes through Supabase Auth's Google provider — Google's client ID/secret live in the Supabase dashboard only, so this needs no new entries in `.env.local`.

1. [Google Cloud Console](https://console.cloud.google.com) → create a project (or pick an existing one) → **APIs & Services → OAuth consent screen**.
   - User type: **External**.
   - Fill in the required fields (app name, your email as support/developer contact). Default scopes (`email`, `profile`, `openid`) are enough — don't add anything else.
   - You can leave publishing status as **Testing** while you're the only user; add your own Google account under "Test users" if so. Switch to "In production" before other people need to sign in with Google (Google review isn't required for these basic scopes).
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs: add **your Supabase project's own callback URL**, not your app's — Supabase's dashboard shows the exact value (next step) in the form `https://<your-project-ref>.supabase.co/auth/v1/callback`.
   - Create it, then copy the **Client ID** and **Client secret**.
3. Supabase dashboard → **Authentication → Providers → Google**:
   - Toggle it on.
   - Paste the Client ID and Client secret from step 2.
   - Copy the callback URL shown on this page if you haven't already used it in step 2.
   - Save.
4. Supabase dashboard → **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` for local dev (change to your real domain once deployed).
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` (and your deployed `https://<your-app-url>/auth/callback` later) — Supabase rejects a `redirectTo` that isn't on this allow-list.
5. That's it — no code changes needed on your end. Once steps 3–4 are saved, "Continue with Google" on `/login` or `/signup` should work.

## 3. Gemini API (free tier, no card)

1. Get a key at [aistudio.google.com](https://aistudio.google.com) (Google AI Studio).
2. Set `GEMINI_API_KEY`.
3. Once set, run `npm run golden-set` — prints personalized/generated quest output for 3 sample founders so you can eyeball AI quality (SPEC §17). Costs a handful of free-tier calls.
4. **Know the limit before you test:** Gemini's free tier caps `gemini-3.6-flash` (the model this app uses for both tiers — see `src/lib/ai/gemini.ts`) at **20 requests/day per model**. That's tight — the golden-set script alone uses 6 of those in one run. Don't run it and do heavy manual testing (quest generation, chat) on the same day, or you'll hit the cap. If you do, the app itself won't break (see step 5 below) — it just won't have real AI output until the quota resets (roughly midnight Pacific time) or you set up the fallback below.

## 4. Groq (optional, free) — fallback for Gemini's tight quota

Gemini's 20/day cap (previous step) is genuinely limiting for active testing. `src/lib/ai/generate-structured.ts` automatically falls back to Groq (free tier: ~1,000 requests/day, far more headroom) whenever Gemini returns a quota (429) or availability (503) error — but only if `GROQ_API_KEY` is set. Skip this section entirely and the app still works exactly as it did before: a Gemini failure just falls back to the raw template / a "try again" chat message.

1. Create a free account at [console.groq.com](https://console.groq.com) — no card required.
2. Create an API key and set `GROQ_API_KEY`.
3. That's it — no other config. The fallback uses `openai/gpt-oss-120b` (see `src/lib/ai/groq.ts` if Groq has since retired that one too — their free-tier lineup changes) and only ever kicks in when Gemini itself fails, so normal usage still gets Gemini's output.

## 5. Resend (free tier, no card)

1. Create an account at [resend.com](https://resend.com).
2. For local testing you can send from Resend's onboarding test domain; add/verify your own sending domain before real users.
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

## 6. Stripe (test mode, free)

1. Create a Stripe account — test mode is on by default, no business verification needed yet.
2. Products → create one Product with one recurring Price (SPEC §3 single tier). Copy the Price id → `STRIPE_PRICE_ID`.
3. Developers → API keys → copy the **test** secret key → `STRIPE_SECRET_KEY`.
4. Webhook, pick one:
   - **Local dev:** install the Stripe CLI, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. It prints a `whsec_...` signing secret → `STRIPE_WEBHOOK_SECRET`.
   - **Deployed:** Developers → Webhooks → add endpoint `https://<your-app-url>/api/webhooks/stripe`, subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`. Copy its signing secret.
5. Test card for checkout: `4242 4242 4242 4242`, any future expiry, any CVC.

## 7. Weekly recap cron (GitHub Actions — free)

1. Generate any random string for `CRON_SECRET` (e.g. `openssl rand -hex 32`) and set it in your env.
2. In the GitHub repo settings → Secrets and variables → Actions, add two repo secrets:
   - `CRON_SECRET` — same value as above
   - `APP_URL` — your deployed app's base URL (this step needs a real deployment; skip until you deploy)
3. `.github/workflows/weekly-recap.yml` fires every Monday 14:00 UTC, or trigger it manually anytime from the Actions tab ("Run workflow").

## 8. App environment

1. `cp .env.example .env.local` and fill in everything from steps 1, 3, 5–7 (Google sign-in in step 2 and Groq in step 4 are both optional).
2. `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev, your real URL once deployed.

## 9. Run it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and:

1. Sign up, log in. If you did step 2 (Google sign-in), also try "Continue with Google" from `/login` or `/signup`.
2. Complete onboarding (try both the plain fields and the optional URL/text-file analysis step).
3. Confirm 3 quests appear on `/quests`; accept one, "show other options" on another, mark one done and submit a result with `converted: yes` — check the dashboard's progress bar, XP/level, and streak update, and that a new quest backfills the slot.
4. Try "not for me" with a reason on a quest.
5. Open the chat bubble, ask a question; if it proposes a quest swap, confirm it and check `/quests` updates.
6. Check `/notifications` for the in-app entries these actions generated.
7. Go to `/billing`, click Subscribe, complete Stripe test checkout, confirm status flips to "active."
8. Trigger the weekly recap manually from GitHub Actions once deployed, or `curl` the route locally with your `CRON_SECRET` to sanity-check it.

Once all of the above is wired up and `.env.local` is filled in, `npm run test:e2e` automates the same core walkthrough (signup→onboarding→dashboard→quest→settings→logout) with Playwright — see `e2e/golden-path.spec.ts`. It hits your real Supabase/Gemini/Stripe setup (no mocks), so it needs everything above done first. It creates and tears down its own test founder (`e2e/global-setup.ts`, `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` if you want to override the defaults) rather than touching whatever account you signed up with by hand.

## 10. Test accounts (a normal founder + an admin)

`/admin` is empty until at least one `admin_users` row exists. Two ways to get test accounts:

**Shortcut — one command creates both:**
```bash
npm run create-test-accounts
```
Creates (or reuses, if run again) a normal founder account and an admin account, and grants the admin one an `admin_users` row — no Supabase dashboard clicking needed. It prints both accounts' emails/passwords when done (defaults: `founder@test.local` / `admin@test.local`, both password `TestPassword123!` — override via `TEST_USER_EMAIL`/`TEST_USER_PASSWORD`/`TEST_ADMIN_EMAIL`/`TEST_ADMIN_PASSWORD` env vars if you want different ones). Log in with either at `/login`.

**Manual — grant an existing account admin access:** if you'd rather use an account you already signed up with by hand, run in Supabase's SQL editor:
```sql
insert into admin_users (auth_user_id, role)
values ('<your auth.users id from the Authentication tab>', 'owner');
```

Either way, visit `/admin` with the admin account — you should see the founders list and be able to use the support overrides.

## 11. Deploy (when ready to test for real, or to unlock the cron)

1. Push to Vercel (free Hobby tier) — connect the repo, set every env var from `.env.local` in the Vercel project settings.
2. Point Stripe's webhook and the `APP_URL` GitHub secret at the deployed URL.
3. Everything through here stays $0 — see `PHASES.md` §0/§12 for the paid swaps (Vercel Pro, Supabase Pro, production Gemini key, custom domain, Stripe live mode) to make only once you're ready for real users, not before.
