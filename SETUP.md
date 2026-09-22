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

## 2. Gemini API (free tier, no card)

1. Get a key at [aistudio.google.com](https://aistudio.google.com) (Google AI Studio).
2. Set `GEMINI_API_KEY`.
3. Once set, run `npm run golden-set` — prints personalized/generated quest output for 3 sample founders so you can eyeball AI quality (SPEC §17). Costs a handful of free-tier calls.

## 3. Resend (free tier, no card)

1. Create an account at [resend.com](https://resend.com).
2. For local testing you can send from Resend's onboarding test domain; add/verify your own sending domain before real users.
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

## 4. Stripe (test mode, free)

1. Create a Stripe account — test mode is on by default, no business verification needed yet.
2. Products → create one Product with one recurring Price (SPEC §3 single tier). Copy the Price id → `STRIPE_PRICE_ID`.
3. Developers → API keys → copy the **test** secret key → `STRIPE_SECRET_KEY`.
4. Webhook, pick one:
   - **Local dev:** install the Stripe CLI, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. It prints a `whsec_...` signing secret → `STRIPE_WEBHOOK_SECRET`.
   - **Deployed:** Developers → Webhooks → add endpoint `https://<your-app-url>/api/webhooks/stripe`, subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`. Copy its signing secret.
5. Test card for checkout: `4242 4242 4242 4242`, any future expiry, any CVC.

## 5. Weekly recap cron (GitHub Actions — free)

1. Generate any random string for `CRON_SECRET` (e.g. `openssl rand -hex 32`) and set it in your env.
2. In the GitHub repo settings → Secrets and variables → Actions, add two repo secrets:
   - `CRON_SECRET` — same value as above
   - `APP_URL` — your deployed app's base URL (this step needs a real deployment; skip until you deploy)
3. `.github/workflows/weekly-recap.yml` fires every Monday 14:00 UTC, or trigger it manually anytime from the Actions tab ("Run workflow").

## 6. App environment

1. `cp .env.example .env.local` and fill in everything from steps 1–5.
2. `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev, your real URL once deployed.

## 7. Run it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and:

1. Sign up, log in.
2. Complete onboarding (try both the plain fields and the optional URL/text-file analysis step).
3. Confirm 3 quests appear on `/quests`; accept one, "show other options" on another, mark one done and submit a result with `converted: yes` — check the dashboard's progress bar, XP/level, and streak update, and that a new quest backfills the slot.
4. Try "not for me" with a reason on a quest.
5. Open the chat bubble, ask a question; if it proposes a quest swap, confirm it and check `/quests` updates.
6. Check `/notifications` for the in-app entries these actions generated.
7. Go to `/billing`, click Subscribe, complete Stripe test checkout, confirm status flips to "active."
8. Trigger the weekly recap manually from GitHub Actions once deployed, or `curl` the route locally with your `CRON_SECRET` to sanity-check it.

## 8. Make yourself an admin

`/admin` is empty until at least one `admin_users` row exists. After your first signup, run in Supabase's SQL editor:

```sql
insert into admin_users (auth_user_id, role)
values ('<your auth.users id from the Authentication tab>', 'owner');
```

Then visit `/admin` — you should see your own founder row and be able to use the support overrides.

## 9. Deploy (when ready to test for real, or to unlock the cron)

1. Push to Vercel (free Hobby tier) — connect the repo, set every env var from `.env.local` in the Vercel project settings.
2. Point Stripe's webhook and the `APP_URL` GitHub secret at the deployed URL.
3. Everything through here stays $0 — see `PHASES.md` §0/§12 for the paid swaps (Vercel Pro, Supabase Pro, production Gemini key, custom domain, Stripe live mode) to make only once you're ready for real users, not before.
