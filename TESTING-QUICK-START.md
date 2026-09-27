# Testing Quick Start Guide

**For rapid testing without reading the full 250+ test case document**

---

## Pre-Flight Checklist (5 minutes)

Before you start testing:

```bash
# 1. Check environment is configured
cat .env.local  # Should have all keys from .env.example

# 2. Install dependencies (if not done)
npm install

# 3. Start development server
npm run dev
```

✅ Open http://localhost:3000 - you should see the landing/login page

---

## Critical Path Test (10-15 minutes)

**This covers the essential user journey. If this works, most of the app works.**

### 1. Sign Up & Onboarding (3 min)
1. Go to `/signup`
2. Enter email: `test@example.com` and password (8+ chars)
3. Complete onboarding:
   - Company name: "TestCo"
   - Industry: Pick any
   - Product: "A test product"
   - Target customer: "Startups"
   - Stage: "Idea"
   - Channels tried: Select 1-2
   - Current customers: 0
   - Skip document upload
4. **✓ Check:** Redirected to `/dashboard` with 3 quests visible

### 2. Dashboard Verification (1 min)
1. **✓ Check:** Progress bar shows "0 / 100"
2. **✓ Check:** XP, Level, Streak displayed
3. **✓ Check:** 3 quest cards visible
4. **✓ Check:** "I got a customer" button present

### 3. Quest Flow (3 min)
1. Go to `/quests`
2. **Accept** one quest
3. **"Not for me"** on another quest (select reason)
4. **"Show other options"** on third quest
5. Go to accepted quest detail page
6. Click "Mark as done"
7. Answer result questions (2-4 questions)
8. Check "Did it convert to a customer?" = **YES**
9. Submit
10. **✓ Check:** Dashboard shows customer count = 1, XP increased, new quest backfilled

### 4. Chat (1 min)
1. Click chat bubble (bottom-right)
2. Ask: "What's my current customer count?"
3. **✓ Check:** AI responds with "1 customer"
4. Ask: "How do I complete my next quest?"
5. **✓ Check:** AI gives relevant guidance

### 5. Subscription (2 min)
1. Go to `/billing`
2. **✓ Check:** Shows trial status (14 days remaining)
3. Click "Subscribe"
4. Enter Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
5. Complete checkout
6. **✓ Check:** Billing page shows "Active" subscription

### 6. Settings & Logout (1 min)
1. Go to `/settings`
2. Change company name to "TestCo Updated"
3. Save
4. **✓ Check:** Name updates
5. Click "Logout"
6. **✓ Check:** Redirected to `/login`, cannot access `/dashboard`

---

## Quick Smoke Tests (5 minutes each)

### Admin Tools
```bash
# Create admin user (if not done)
npm run create-test-accounts
```

1. Log in with `admin@test.local` / `TestPassword123!`
2. Go to `/admin`
3. **✓ Check:** Founders list visible
4. Click on a founder
5. **✓ Check:** Can view growth profile, override subscription, adjust customer count

### Notifications
1. Complete a quest → Check `/notifications` for "Quest completed" entry
2. Accept a quest → Check `/notifications` for "New quest available"
3. Go to `/settings/notifications` → Toggle email off → Verify setting saves

### Mobile Responsive
1. Resize browser to 375px width (iPhone size)
2. **✓ Check:** Dashboard readable, quest cards stack vertically
3. **✓ Check:** Chat opens full-screen or as overlay
4. **✓ Check:** Can complete onboarding flow

### AI Quality
```bash
npm run golden-set
```
**✓ Check:** Prints 3 personalized quests for sample founders, no errors

### E2E Test
```bash
npm run test:e2e
```
**✓ Check:** Test passes (signup → onboarding → dashboard → quest → logout)

---

## Common Issues & Fixes

### "AI generation failed"
- **Cause:** Gemini API key missing/invalid or quota exceeded (20/day)
- **Fix:** 
  1. Check `GEMINI_API_KEY` in `.env.local`
  2. Configure Groq fallback: Add `GROQ_API_KEY` (see SETUP.md step 4)

### "Database error"
- **Cause:** Supabase not configured
- **Fix:**
  1. Create Supabase project
  2. Run `supabase/schema.sql` in SQL Editor
  3. Run `supabase/seed.sql` in SQL Editor
  4. Add keys to `.env.local`

### "Stripe checkout fails"
- **Cause:** Stripe keys missing or webhook not configured
- **Fix:**
  1. Add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` to `.env.local`
  2. Run Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### "No quests appear"
- **Cause:** Quest templates not seeded
- **Fix:** Run `supabase/seed.sql` in Supabase SQL Editor

### "/admin returns 403"
- **Cause:** No admin_users row for your account
- **Fix:** 
  ```bash
  npm run create-test-accounts
  # OR manually in Supabase SQL Editor:
  # INSERT INTO admin_users (auth_user_id, role) VALUES ('<your-auth-id>', 'owner');
  ```

---

## Test Data Reference

### Stripe Test Cards
- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`
- Use any future expiry date and any 3-digit CVC

### Test Accounts (after `npm run create-test-accounts`)
- **Founder:** `founder@test.local` / `TestPassword123!`
- **Admin:** `admin@test.local` / `TestPassword123!`

### Sample Founder Profile (for onboarding)
```
Company: TestStartup
Industry: SaaS / B2B Software
Product: Project management tool for remote teams
Target Customer: Startup founders with 5-50 employees
Stage: Idea
Channels Tried: cold_email, content
Current Customers: 0
```

---

## Where to Find Detailed Tests

- **Full test plan:** [TEST-PLAN.md](./TEST-PLAN.md) (250+ test cases)
- **Setup instructions:** [SETUP.md](./SETUP.md)
- **Product spec:** [SPEC.md](./SPEC.md)
- **Build phases:** [PHASES.md](./PHASES.md)

---

## Reporting Issues

When reporting a bug, include:
1. **Test case ID** (from TEST-PLAN.md if applicable)
2. **Steps to reproduce**
3. **Expected result**
4. **Actual result**
5. **Browser/OS**
6. **Screenshots** (if UI issue)
7. **Console errors** (if any)

Example:
```
Test Case: 3.1.3 (XP display)
Steps: 1. Complete quest worth 50 XP 2. Check dashboard
Expected: XP increased by 50
Actual: XP unchanged
Browser: Chrome 131 on Windows 11
Console: "TypeError: Cannot read property 'xp_value' of undefined"
```

---

## Quick Health Check Script

Run this to verify everything is configured:

```bash
#!/bin/bash
# health-check.sh

echo "🔍 Checking environment..."

# Check .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local missing!"
  exit 1
fi

# Check required env vars
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "GEMINI_API_KEY" "STRIPE_SECRET_KEY" "RESEND_API_KEY")

for var in "${required_vars[@]}"; do
  if ! grep -q "$var=" .env.local; then
    echo "❌ $var missing in .env.local"
    exit 1
  fi
done

echo "✅ All required env vars present"

# Check if dev server is running
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Dev server running on :3000"
else
  echo "⚠️  Dev server not running - run 'npm run dev'"
fi

# Check node modules
if [ ! -d node_modules ]; then
  echo "❌ node_modules missing - run 'npm install'"
  exit 1
fi

echo "✅ node_modules installed"

echo ""
echo "🎉 Environment looks good! Start testing:"
echo "   1. Open http://localhost:3000"
echo "   2. Follow Critical Path Test (above)"
```

Save as `health-check.sh`, run with `bash health-check.sh`

---

**Happy Testing! 🚀**
