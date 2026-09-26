# Get100-Customers — Comprehensive Test Plan

**Version:** 1.0  
**Date:** September 24, 2026  
**Purpose:** Manual testing checklist covering all implemented features

---

## Pre-Testing Setup

Before you begin testing, ensure you have completed [SETUP.md](./SETUP.md) sections 1-9. All tests below assume:

- ✅ Supabase project created and schema + seeds applied
- ✅ Gemini API key configured (or Groq fallback)
- ✅ Stripe test mode configured
- ✅ Resend configured
- ✅ `.env.local` populated
- ✅ `npm install` completed
- ✅ `npm run dev` running on http://localhost:3000

---

## 1. AUTHENTICATION & AUTHORIZATION

### 1.1 Email Signup
**URL:** `/signup`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 1.1.1 | Valid email signup | 1. Navigate to /signup<br>2. Enter valid email & password (min 8 chars)<br>3. Submit | • Account created<br>• Email verification sent (if enabled)<br>• Redirected to /onboarding | ☐ | |
| 1.1.2 | Invalid email format | 1. Enter invalid email (no @, no domain)<br>2. Submit | • Error message displayed<br>• Form not submitted | ☐ | |
| 1.1.3 | Weak password | 1. Enter password < 8 characters<br>2. Submit | • Password validation error shown | ☐ | |
| 1.1.4 | Duplicate email | 1. Sign up with existing email<br>2. Submit | • Error: "User already registered" or similar | ☐ | |
| 1.1.5 | Email confirmation flow | 1. Check email inbox<br>2. Click verification link | • Redirects to app<br>• Account activated | ☐ | Skip if "Confirm email" disabled in Supabase |

### 1.2 Email Login
**URL:** `/login`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 1.2.1 | Valid login | 1. Navigate to /login<br>2. Enter correct email & password<br>3. Submit | • Logged in successfully<br>• Redirected to /dashboard | ☐ | |
| 1.2.2 | Wrong password | 1. Enter valid email<br>2. Enter incorrect password<br>3. Submit | • Error message: "Invalid credentials" | ☐ | |
| 1.2.3 | Non-existent email | 1. Enter email that doesn't exist<br>2. Submit | • Error message displayed | ☐ | |
| 1.2.4 | Remember me | 1. Check "Remember me" (if implemented)<br>2. Login<br>3. Close browser<br>4. Return to site | • Still logged in | ☐ | Check if feature exists |

### 1.3 Google OAuth (if configured)
**URL:** `/login` or `/signup`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 1.3.1 | Google signup | 1. Click "Continue with Google"<br>2. Select Google account<br>3. Authorize | • Account created<br>• Redirected to /onboarding | ☐ | |
| 1.3.2 | Google login (existing) | 1. Click "Continue with Google"<br>2. Select existing account | • Logged in<br>• Redirected to /dashboard | ☐ | |
| 1.3.3 | Google OAuth cancel | 1. Click "Continue with Google"<br>2. Cancel on Google consent screen | • Returned to login page<br>• No account created | ☐ | |

### 1.4 Password Reset
**URL:** `/login` or `/forgot-password`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 1.4.1 | Request password reset | 1. Click "Forgot password?"<br>2. Enter email<br>3. Submit | • Reset email sent<br>• Confirmation message shown | ☐ | |
| 1.4.2 | Use reset link | 1. Open reset email<br>2. Click link<br>3. Enter new password | • Password updated<br>• Can login with new password | ☐ | |
| 1.4.3 | Expired reset link | 1. Use reset link >24h old | • Error: "Link expired" | ☐ | May need to manipulate time |

### 1.5 Session Management

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 1.5.1 | Session persistence | 1. Login<br>2. Refresh page | • Still logged in<br>• No redirect to /login | ☐ | |
| 1.5.2 | Logout | 1. Click logout (in settings or header)<br>2. Try to access /dashboard | • Session cleared<br>• Redirected to /login | ☐ | |
| 1.5.3 | Concurrent sessions | 1. Login on browser A<br>2. Login on browser B<br>3. Logout on browser A<br>4. Check browser B | • Browser B still logged in | ☐ | |

---

## 2. ONBOARDING

### 2.1 Onboarding Flow
**URL:** `/onboarding`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 2.1.1 | Complete onboarding (minimal) | 1. Fill in all required fields:<br>   - Company name<br>   - Industry<br>   - Product description<br>   - Target customer (ICP)<br>   - Stage (idea/prototype/launched)<br>   - Channels tried<br>   - Current customer count<br>2. Skip document upload<br>3. Submit | • Progress through all steps<br>• Founder profile created<br>• Growth profile initialized<br>• Redirected to /dashboard<br>• 3 initial quests generated | ☐ | |
| 2.1.2 | URL analysis | 1. Enter website URL in document upload step<br>2. Wait for AI analysis | • Loading indicator shown<br>• Fields pre-filled/enriched with extracted data<br>• Can edit AI suggestions | ☐ | Requires Gemini API |
| 2.1.3 | Document upload | 1. Upload pitch deck PDF or text file<br>2. Wait for analysis | • File uploaded<br>• AI extracts info<br>• Fields enriched | ☐ | Requires Gemini API + Supabase Storage |
| 2.1.4 | Skip onboarding | 1. Try to access /dashboard without completing onboarding | • Redirected back to /onboarding | ☐ | |
| 2.1.5 | Industry selection | 1. Select each industry option | • Relevant industry shown in profile<br>• Quests later match industry | ☐ | Check all industries work |
| 2.1.6 | Stage: Idea | 1. Select "Idea" stage<br>2. Complete onboarding | • Quests appropriate for pre-launch | ☐ | |
| 2.1.7 | Stage: Launched | 1. Select "Launched" stage<br>2. Complete onboarding | • Quests appropriate for live product | ☐ | |
| 2.1.8 | Channels already tried | 1. Select multiple channels (e.g. cold_email, content)<br>2. Complete onboarding | • Growth profile reflects channels tried<br>• New quests avoid these channels initially | ☐ | |
| 2.1.9 | Current customer count >100 | 1. Enter customer count ≥100<br>2. Complete onboarding<br>3. Check dashboard | • Skip 0→100 framing<br>• Start in "Growth Mode"<br>• Next milestone (250/500) shown | ☐ | SPEC §14 |
| 2.1.10 | Field validation | 1. Leave required fields blank<br>2. Try to submit | • Validation errors shown<br>• Cannot proceed | ☐ | |

### 2.2 Onboarding Edge Cases

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 2.2.1 | Return to onboarding | 1. Start onboarding<br>2. Close browser mid-way<br>3. Return to /onboarding | • Resume where left off<br>OR start over (acceptable) | ☐ | |
| 2.2.2 | AI extraction failure | 1. Upload invalid/corrupt file<br>2. Or enter invalid URL | • Error message shown<br>• Can skip and continue manually | ☐ | |
| 2.2.3 | Gemini quota exceeded | 1. Trigger onboarding after 20 Gemini calls today | • Falls back to Groq (if configured)<br>OR shows manual-only form | ☐ | Hard to test without hitting quota |

---

## 3. DASHBOARD

### 3.1 Dashboard Core UI
**URL:** `/dashboard`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.1.1 | Dashboard load | 1. Navigate to /dashboard after onboarding | • Progress bar visible (X / 100)<br>• XP, Level, Streak displayed<br>• Active quests section (up to 3 cards)<br>• Growth insights panel<br>• "I got a customer" button | ☐ | |
| 3.1.2 | Progress bar accuracy | 1. Check customer count matches founder profile | • Bar shows correct fraction<br>• Number matches database | ☐ | |
| 3.1.3 | XP display | 1. Note current XP<br>2. Complete a quest<br>3. Return to dashboard | • XP increased by quest's xp_value | ☐ | |
| 3.1.4 | Level display | 1. Check current level<br>2. Gain enough XP to level up | • Level increments<br>• Level-up celebration shown (if implemented) | ☐ | May require multiple quests |
| 3.1.5 | Streak display | 1. Complete quest today<br>2. Check next day<br>3. Complete another quest | • Streak increments | ☐ | Requires multi-day testing |
| 3.1.6 | Streak reset | 1. Complete quest<br>2. Wait >7 days without activity<br>3. Check dashboard | • Streak reset to 0<br>• XP/Level unaffected | ☐ | SPEC §6 |
| 3.1.7 | Active quests display | 1. Accept quests until 3 active<br>2. Check dashboard | • Shows all 3 quests<br>• Quest cards show title, description, category, suggested_window | ☐ | |
| 3.1.8 | Empty quest slots | 1. Complete/skip quests until <3 active<br>2. Check dashboard | • Empty slots show "Accept a quest" or similar prompt | ☐ | |
| 3.1.9 | Growth insights panel | 1. Complete multiple quests with results<br>2. Check insights panel | • Shows "what's working"<br>• Shows best channel with customer count<br>• Shows bottleneck hypothesis | ☐ | SPEC §9 |

### 3.2 Customer Logging
**URL:** `/dashboard` (via "I got a customer" button)

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.2.1 | Log customer (quest-based) | 1. Complete quest<br>2. Report result with "converted: yes"<br>3. Check dashboard | • Customer count +1<br>• Progress bar updates<br>• XP awarded<br>• customer_events log created | ☐ | |
| 3.2.2 | Log customer (manual) | 1. Click "I got a customer" button<br>2. Fill in details (optional quest, note)<br>3. Submit | • Customer count +1<br>• Progress bar updates<br>• customer_events log created | ☐ | |
| 3.2.3 | Milestone celebrations | 1. Reach 1st customer<br>2. Reach 10th customer<br>3. Reach 25, 50, 100 | • Celebration modal/animation shown<br>• Notification sent<br>• XP bonus (if implemented) | ☐ | SPEC §11 milestones |
| 3.2.4 | Reach 100 customers | 1. Log 100th customer<br>2. Check dashboard | • Progress bar complete<br>• "Growth Mode" celebration<br>• New milestone shown (250 or 500)<br>• Can continue using app | ☐ | SPEC §14 |

---

## 4. QUEST SYSTEM

### 4.1 Quest Discovery
**URL:** `/quests`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.1.1 | View suggested quests | 1. Navigate to /quests | • 1 primary recommended quest shown<br>• "Show other options" button visible<br>• Quest shows: title, description, instructions, category, xp_value, tools_provided | ☐ | |
| 4.1.2 | Show alternative quests | 1. Click "Show other options" | • 2-3 alternative quests appear<br>• Alternatives are different from primary | ☐ | SPEC §7.4 |
| 4.1.3 | Accept quest | 1. Click "Accept" on a quest<br>2. Check /dashboard | • Quest moves to `active` status<br>• Appears in dashboard active quests (up to 3)<br>• Slot opens for new quest | ☐ | |
| 4.1.4 | "Not for me" with reason | 1. Click "Not for me" on a quest<br>2. Select reason (too hard/not relevant/already tried/no time)<br>3. Confirm | • Quest moves to `skipped` status<br>• Reason recorded<br>• Growth profile updated (deprioritizes this quest type)<br>• New quest recommended | ☐ | SPEC §7.4 |
| 4.1.5 | Quest personalization | 1. Check quest title/description<br>2. Verify it references founder's product/ICP | • Quest text includes company name, product, or target customer<br>• Feels specific, not generic | ☐ | SPEC §7.2, §17 |
| 4.1.6 | Quest channel variety | 1. Accept 5+ quests over time<br>2. Note categories | • Variety of channels (cold_email, content, community, partnerships, etc.)<br>• Reinforces working channels<br>• Balances quick wins vs big swings | ☐ | SPEC §7.4 |

### 4.2 Quest Execution
**URL:** `/quests/[id]`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.2.1 | View quest details | 1. Click on active quest<br>2. View detail page | • Full instructions shown<br>• Tools/templates section visible<br>• Sub-tasks checklist (if multi-step)<br>• "Mark as done" button | ☐ | |
| 4.2.2 | Use quest tools | 1. Check "Your tools for this quest" section<br>2. View templates | • Personalized email templates<br>• DM scripts<br>• Copy frameworks<br>• References founder's product/ICP | ☐ | SPEC §8 |
| 4.2.3 | Complete sub-tasks | 1. Check off sub-tasks one by one | • Sub-tasks toggle checked<br>• Progress indicator updates (if shown) | ☐ | Optional feature |
| 4.2.4 | Mark quest done | 1. Click "Mark as done"<br>2. Answer structured result questions (2-4 questions)<br>3. Add free-text notes (optional)<br>4. Submit | • Quest moves to `awaiting_report` → `completed`<br>• XP awarded<br>• Completion recorded<br>• Growth profile updates | ☐ | SPEC §8 |
| 4.2.5 | Quest result questions | 1. Check result questions for quest<br>2. Verify they're type-specific | • Questions relevant to quest category<br>• E.g. cold_email: "Reach count? Response count? Did it convert?"<br>• E.g. content: "Views? Engagement? Leads?" | ☐ | SPEC §7.2, §8 |
| 4.2.6 | Skip result questions | 1. Try to submit without answering required questions | • Validation error<br>• Cannot submit until fields filled | ☐ | |

### 4.3 Quest Lifecycle

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.3.1 | Quest expiration | 1. Accept quest with suggested_window (e.g. "3-5 days")<br>2. Wait past window<br>3. Check quest status | • Quest auto-moves to `expired` (then `skipped`)<br>• Reason: expired<br>• Slot opens for new quest | ☐ | SPEC §7.3 |
| 4.3.2 | Concurrent quest limit | 1. Accept 3 quests<br>2. Try to accept a 4th | • Cannot accept (button disabled or message shown)<br>• Must complete/skip one first | ☐ | SPEC §7.3, max 3 active |
| 4.3.3 | Quest journal | 1. Complete/skip several quests<br>2. Navigate to /quests/journal or similar | • View history of all completed/skipped quests<br>• Shows title, date, outcome | ☐ | SPEC §6 |

### 4.4 Quest Generation Quality

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.4.1 | Template vs AI-generated | 1. Check quest `template_id` in database<br>2. Note which quests have template_id=null | • Most quests use templates<br>• Some quests are net-new AI-generated<br>• Both are high quality | ☐ | SPEC §7.1 hybrid approach |
| 4.4.2 | Run golden-set check | 1. Run `npm run golden-set`<br>2. Review printed quest output | • 3 sample founders get personalized quests<br>• No fabricated facts<br>• Quest text maps to founder profile | ☐ | SPEC §17 |
| 4.4.3 | AI fallback (Gemini quota) | 1. Hit Gemini's 20/day limit<br>2. Try to generate new quest | • Falls back to Groq (if configured)<br>OR falls back to template without personalization<br>• No broken/empty quest shown | ☐ | SPEC §15, SETUP.md step 4 |

---

## 5. GROWTH PROFILE & AI ADAPTATION

### 5.1 Growth Profile Updates
**Access via:** Database query or admin view

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 5.1.1 | channels_tried updates | 1. Complete quest in channel X with "converted: yes"<br>2. Check growth_profiles.channels_tried | • Channel X has attempts +1<br>• Channel X has successes +1<br>• Conversion rate calculated | ☐ | SPEC §9 |
| 5.1.2 | what_working insights | 1. Complete multiple successful quests in same channel<br>2. Check growth_profiles.what_working | • AI-derived insight added<br>• Includes supporting evidence | ☐ | SPEC §9 |
| 5.1.3 | what_not_working insights | 1. Complete multiple failed quests in same channel<br>2. Check growth_profiles.what_not_working | • Insight about underperforming channel<br>• Evidence included | ☐ | SPEC §9 |
| 5.1.4 | bottleneck_hypothesis | 1. Complete diverse quests with mixed results<br>2. Check growth_profiles.bottleneck_hypothesis | • AI's best guess at biggest blocker<br>• E.g. "messaging isn't resonating" or "not enough volume" | ☐ | SPEC §9 |
| 5.1.5 | strategy_history | 1. Make significant profile edit (change industry)<br>2. Check growth_profiles.strategy_history | • New entry logged<br>• Includes date and rationale | ☐ | SPEC §5, §9 |

### 5.2 AI-Driven Quest Recommendations

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 5.2.1 | Reinforce working channels | 1. Complete multiple successful quests in channel A<br>2. Check next recommended quest | • More quests from channel A appear<br>• Probability of channel A quests increases | ☐ | SPEC §7.4 |
| 5.2.2 | Deprioritize skipped quest types | 1. Skip quests of type X repeatedly (with "not relevant" reason)<br>2. Check next recommendations | • Fewer/no type X quests recommended | ☐ | SPEC §7.4 |
| 5.2.3 | Balance quick wins vs big swings | 1. Accept 10+ quests<br>2. Review quest xp_value and suggested_window | • Mix of low-effort/low-XP and high-effort/high-XP quests<br>• Not all the same difficulty | ☐ | SPEC §7.4 |

---

## 6. AI COACH CHAT

### 6.1 Chat Interface
**Access via:** Chat bubble (bottom-right) or `/chat`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.1.1 | Open chat | 1. Click chat bubble<br>2. Chat panel opens | • Chat panel/sidebar appears<br>• Message history visible (if any)<br>• Input field ready | ☐ | SPEC §10 |
| 6.1.2 | Ask question about current quest | 1. Type: "How do I complete this quest?"<br>2. Send | • AI responds with quest-specific guidance<br>• References current active quest | ☐ | |
| 6.1.3 | Request quest swap | 1. Type: "I don't like my current quest"<br>2. Wait for AI response | • AI proposes alternative quest<br>• Asks for confirmation before swapping | ☐ | SPEC §10 |
| 6.1.4 | Confirm quest swap | 1. AI proposes swap<br>2. Confirm | • Current quest moves to skipped<br>• New quest moves to active<br>• Dashboard updates | ☐ | |
| 6.1.5 | General growth question | 1. Ask: "What's the best way to reach B2B customers?" | • AI responds with advice<br>• References founder's profile/industry | ☐ | |
| 6.1.6 | "Why did you recommend this?" | 1. Ask about a specific quest recommendation | • AI explains reasoning<br>• References growth profile insights | ☐ | SPEC §10 |
| 6.1.7 | Chat has full context | 1. Ask: "What's my current customer count?"<br>2. Ask: "What channels have I tried?" | • Answers correctly using founder profile + growth profile<br>• Not a blank assistant | ☐ | SPEC §10 |
| 6.1.8 | Chat is coaching only | 1. Ask AI to: "Send this email to prospects" | • AI explains it cannot take actions<br>• Offers coaching/templates instead | ☐ | SPEC §1 automation model |

### 6.2 Chat Edge Cases

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.2.1 | Chat across page navigation | 1. Open chat<br>2. Navigate to different page<br>3. Check chat | • Chat history persists<br>• Can continue conversation | ☐ | |
| 6.2.2 | AI unavailable (quota) | 1. Hit Gemini quota<br>2. Try to send chat message | • Falls back to Groq (if configured)<br>OR error message: "AI temporarily unavailable" | ☐ | |
| 6.2.3 | Long chat history | 1. Send 20+ messages<br>2. Check UI | • Chat scrollable<br>• Loads older messages (or pages them) | ☐ | |

---

## 7. NOTIFICATIONS

### 7.1 In-App Notifications
**URL:** `/notifications`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 7.1.1 | View notifications page | 1. Navigate to /notifications | • List of recent notifications<br>• Grouped by type<br>• Timestamps shown | ☐ | |
| 7.1.2 | New quest available | 1. Complete a quest (slot opens)<br>2. Check /notifications | • Notification: "New quest available" | ☐ | SPEC §11 |
| 7.1.3 | Suggested window approaching | 1. Accept quest with 3-day window<br>2. Wait 2.5 days<br>3. Check notifications | • Notification: "Your quest deadline is approaching" | ☐ | SPEC §11 |
| 7.1.4 | Re-engagement after inactivity | 1. Have active quests<br>2. Don't log in for 5 days<br>3. Check notifications on return | • Notification: "Your quest is still open — need a hand?" | ☐ | SPEC §11 |
| 7.1.5 | Milestone notifications | 1. Reach 10, 25, 50, 100 customers<br>2. Check notifications | • Milestone celebration notification for each | ☐ | SPEC §11 |
| 7.1.6 | Level up notification | 1. Gain enough XP to level up<br>2. Check notifications | • Notification: "You leveled up!" | ☐ | SPEC §11 |
| 7.1.7 | Growth Mode entry | 1. Reach 100 customers<br>2. Check notifications | • Notification: "Welcome to Growth Mode!" | ☐ | SPEC §11, §14 |

### 7.2 Email Notifications

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 7.2.1 | New quest available email | 1. Complete quest<br>2. Check email inbox | • Email: "New quest available"<br>• Deep link to /quests | ☐ | SPEC §11 |
| 7.2.2 | Weekly progress recap | 1. Trigger cron manually or wait for Monday 14:00 UTC<br>2. Check email | • Email summarizing week's activity<br>• Customer count, XP gained, quests completed | ☐ | SPEC §11, .github/workflows/weekly-recap.yml |
| 7.2.3 | Re-engagement email (5 days) | 1. Don't log in for 5 days<br>2. Check email | • Re-engagement email sent | ☐ | SPEC §11 |
| 7.2.4 | Notification preferences | 1. Go to settings<br>2. Toggle email notifications off for category<br>3. Trigger that event | • No email sent for toggled-off category<br>• In-app notification still works | ☐ | SPEC §11 |

---

## 8. SETTINGS & PROFILE MANAGEMENT

### 8.1 Founder Profile Editing
**URL:** `/settings` or `/settings/profile`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 8.1.1 | Edit company name | 1. Change company name<br>2. Save | • Profile updated<br>• New name appears in future quests | ☐ | |
| 8.1.2 | Edit product description | 1. Update product description<br>2. Save | • Profile updated<br>• Quest personalization reflects change | ☐ | |
| 8.1.3 | Change industry | 1. Change industry selection<br>2. Save | • Profile updated<br>• strategy_history entry logged<br>• Short re-onboarding check-in (optional) | ☐ | SPEC §5 |
| 8.1.4 | Update ICP | 1. Change target customer description<br>2. Save | • Profile updated | ☐ | |
| 8.1.5 | Change stage | 1. Move from "Idea" to "Launched"<br>2. Save | • Profile updated<br>• Future quests match new stage | ☐ | |
| 8.1.6 | Adjust customer count manually | 1. Change current_customer_count<br>2. Save | • Progress bar updates<br>• customer_events log: type=corrected | ☐ | SPEC §8, §14 |
| 8.1.7 | Large downward correction (churn) | 1. Decrease customer count by >10<br>2. Save | • customer_events logged as flagged<br>• Growth profile notes the churn<br>• AI addresses it in coaching | ☐ | SPEC §14 |

### 8.2 Account Settings
**URL:** `/settings/account`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 8.2.1 | Change email | 1. Update email address<br>2. Confirm | • New email verification sent<br>• Login requires new email after confirmed | ☐ | If feature exists |
| 8.2.2 | Change password | 1. Enter current password<br>2. Enter new password<br>3. Save | • Password updated<br>• Must use new password on next login | ☐ | |
| 8.2.3 | Delete account | 1. Click "Delete account"<br>2. Confirm deletion | • Account marked for deletion OR immediately deleted<br>• All data cascades (profile, quests, results, growth profile)<br>• Cannot log back in | ☐ | SPEC §13 |
| 8.2.4 | Export account data | 1. Request data export<br>2. Download file | • JSON/CSV file with all founder data<br>• Includes: profile, quests, results, growth profile | ☐ | SPEC §13 |

### 8.3 Notification Preferences
**URL:** `/settings/notifications`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 8.3.1 | Toggle email notifications | 1. Disable email notifications for "New quest available"<br>2. Save<br>3. Trigger event | • No email sent<br>• In-app notification still sent | ☐ | SPEC §11 |
| 8.3.2 | Toggle all emails | 1. Disable all email categories<br>2. Save<br>3. Trigger various events | • No emails sent<br>• In-app notifications still work | ☐ | |

---

## 9. SUBSCRIPTION & PAYMENTS

### 9.1 Trial & Subscription Signup
**URL:** `/billing` or `/subscribe`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 9.1.1 | Trial starts on signup | 1. Sign up new account<br>2. Check subscriptions table | • trial_ends_at = 14 days from signup<br>• status = trialing | ☐ | SPEC §3 |
| 9.1.2 | View billing page during trial | 1. Navigate to /billing during trial | • Shows trial end date<br>• "Subscribe now" button visible<br>• No payment method on file | ☐ | |
| 9.1.3 | Subscribe (add payment) | 1. Click "Subscribe"<br>2. Enter Stripe test card: 4242 4242 4242 4242<br>3. Complete checkout | • Redirected back to app<br>• Status = active<br>• Billing page shows subscription active | ☐ | SPEC §3, SETUP.md step 6 |
| 9.1.4 | Trial expires without payment | 1. Wait until trial_ends_at + 1 day<br>2. Try to access app | • Account moves to restricted mode<br>• Can view history/progress (read-only)<br>• Cannot receive new quests or use chat<br>• Paywall shown | ☐ | SPEC §3 |
| 9.1.5 | Subscribe after trial expires | 1. In restricted mode<br>2. Click "Subscribe"<br>3. Complete payment | • Account reactivated<br>• status = active<br>• Full access restored | ☐ | |

### 9.2 Subscription Management
**URL:** `/billing`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 9.2.1 | View billing history | 1. Navigate to /billing<br>2. Check past invoices | • List of invoices shown<br>• Each has date, amount, status | ☐ | |
| 9.2.2 | Update payment method | 1. Click "Update payment"<br>2. Enter new card<br>3. Save | • Payment method updated in Stripe<br>• Next invoice charges new card | ☐ | |
| 9.2.3 | Cancel subscription | 1. Click "Cancel subscription"<br>2. Confirm cancellation | • status = canceled (at period end) OR immediately<br>• Confirmation message shown | ☐ | |
| 9.2.4 | Reactivate after cancel | 1. After cancellation (before period end)<br>2. Click "Reactivate" | • status = active<br>• Subscription continues | ☐ | If feature exists |

### 9.3 Payment Failures & Dunning
**Requires simulating failed payment in Stripe**

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 9.3.1 | Payment fails on renewal | 1. Simulate failed payment in Stripe<br>2. Check app | • In-app notification: "Payment failed"<br>• Email notification sent<br>• Grace period starts (7 days) | ☐ | SPEC §3 |
| 9.3.2 | Grace period active | 1. During 7-day grace period<br>2. Try to use app | • Full access still works<br>• Banner/reminder to update payment | ☐ | SPEC §3 |
| 9.3.3 | Grace period expires | 1. Wait >7 days without payment fix<br>2. Try to access app | • Account moves to restricted mode<br>• Can view history (read-only)<br>• Cannot receive new quests or use chat<br>• Paywall shown | ☐ | SPEC §3 |
| 9.3.4 | Update payment during grace | 1. Update payment method during grace period<br>2. Stripe retries payment | • Payment succeeds<br>• status = active<br>• Grace period ends | ☐ | |
| 9.3.5 | Update payment after restriction | 1. In restricted mode<br>2. Update payment method | • Subscription reactivated<br>• Full access restored | ☐ | |

### 9.4 Webhooks & Stripe Integration

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 9.4.1 | checkout.session.completed | 1. Complete Stripe checkout<br>2. Check subscriptions table | • Subscription created/updated<br>• status = active<br>• billing_provider_ref populated | ☐ | |
| 9.4.2 | invoice.payment_succeeded | 1. Successful payment<br>2. Check app | • Subscription remains active<br>• Invoice recorded | ☐ | |
| 9.4.3 | invoice.payment_failed | 1. Failed payment<br>2. Check app | • Grace period logic triggers<br>• Notifications sent | ☐ | |
| 9.4.4 | customer.subscription.updated | 1. Change subscription in Stripe dashboard<br>2. Check app | • Subscription data synced<br>• App reflects changes | ☐ | |
| 9.4.5 | customer.subscription.deleted | 1. Delete subscription in Stripe<br>2. Check app | • status = canceled<br>• Access restricted | ☐ | |

---

## 10. ADMIN TOOLS

### 10.1 Admin Authentication
**URL:** `/admin`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 10.1.1 | Admin user access | 1. Log in with admin account (see SETUP.md §10)<br>2. Navigate to /admin | • Admin dashboard visible<br>• Founders list shown | ☐ | |
| 10.1.2 | Non-admin access | 1. Log in with normal founder account<br>2. Try to access /admin | • Redirected to /dashboard<br>OR 403 error | ☐ | |
| 10.1.3 | Unauthenticated access | 1. Log out<br>2. Try to access /admin | • Redirected to /login | ☐ | |

### 10.2 Admin Founder List
**URL:** `/admin`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 10.2.1 | View founders list | 1. Check admin dashboard | • List of all founders shown<br>• Columns: name, email, subscription status, last active, quests completed, customer count | ☐ | SPEC §12 |
| 10.2.2 | Search founders | 1. Use search box<br>2. Enter founder name/email | • List filters to matching results | ☐ | |
| 10.2.3 | Filter by subscription status | 1. Filter by "active" / "trialing" / "restricted" | • List shows only matching founders | ☐ | |
| 10.2.4 | Sort founders | 1. Click column headers (name, last active, etc.) | • List re-sorts by clicked column | ☐ | |

### 10.3 Admin Founder Detail
**URL:** `/admin/founders/[id]`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 10.3.1 | View founder details | 1. Click on a founder in list<br>2. View detail page | • Founder profile shown<br>• Growth profile shown (read-only)<br>• Quest history visible<br>• Subscription status visible | ☐ | SPEC §12 |
| 10.3.2 | Manual subscription override | 1. Click "Override subscription"<br>2. Change status to "active"<br>3. Save | • subscriptions.status updated<br>• Founder immediately gets access | ☐ | SPEC §12 |
| 10.3.3 | Manual customer count override | 1. Change customer count<br>2. Save | • founders.current_customer_count updated<br>• customer_events log: type=admin_override | ☐ | SPEC §12 |
| 10.3.4 | View growth profile (read-only) | 1. Scroll to growth profile section | • channels_tried visible<br>• what_working / what_not_working shown<br>• bottleneck_hypothesis shown<br>• Cannot edit (read-only) | ☐ | SPEC §12 |

---

## 11. EDGE CASES & ERROR HANDLING

### 11.1 Profile Context Drift
**SPEC §5 [Fast-follow]**

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 11.1.1 | Detect channel mismatch | 1. Profile says "channels_tried: []"<br>2. Complete quests in cold_email repeatedly<br>3. Check for drift prompt | • AI surfaces check-in: "Has anything changed?"<br>• Prompt is dismissible | ☐ | May not be implemented yet |
| 11.1.2 | Significant profile edit | 1. Change industry drastically<br>2. Save | • strategy_history logged<br>• Short re-onboarding check-in triggered<br>• Customer count, XP, level unchanged | ☐ | SPEC §5 |

### 11.2 Business Pivot Handling

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 11.2.1 | Pivot product | 1. Edit product description radically<br>2. Save | • strategy_history entry created<br>• Customer count preserved<br>• XP/level preserved<br>• Quest recommendations adapt | ☐ | SPEC §14 |

### 11.3 Disagreeing with Recommendations

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 11.3.1 | Skip repeatedly | 1. Skip 5+ quests of same type<br>2. Check next recommendations | • Fewer quests of that type<br>• Alternative channels recommended | ☐ | SPEC §14 |
| 11.3.2 | Always request alternatives | 1. Always click "Show other options"<br>2. Never accept primary quest | • System continues offering alternatives<br>• No dead end | ☐ | SPEC §14 |

### 11.4 System Errors & Fallbacks

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 11.4.1 | Database connection failure | 1. Simulate DB disconnect<br>2. Try to load page | • Error page shown<br>• User-friendly message<br>• Retry option | ☐ | Hard to test without breaking DB |
| 11.4.2 | AI generation failure | 1. Force Gemini API error<br>2. Try to generate quest | • Falls back to Groq (if configured)<br>OR falls back to template library<br>• No broken/empty quest | ☐ | SPEC §17 |
| 11.4.3 | Stripe webhook failure | 1. Simulate webhook delivery failure<br>2. Check subscription status | • Subscription state syncs on next user action<br>OR manual admin override available | ☐ | |
| 11.4.4 | Email send failure | 1. Configure invalid RESEND_API_KEY<br>2. Trigger email notification | • Email fails gracefully<br>• In-app notification still works<br>• Error logged for admin | ☐ | |

---

## 12. PERFORMANCE & LOAD

### 12.1 Page Load Times

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 12.1.1 | Dashboard load | 1. Navigate to /dashboard<br>2. Measure time | • Loads in <2 seconds<br>• No layout shift | ☐ | SPEC §20 |
| 12.1.2 | Quest generation | 1. Complete quest (triggers new quest gen)<br>2. Measure time | • New quest appears in <3 seconds<br>OR loads async with skeleton | ☐ | SPEC §20 |
| 12.1.3 | Chat response time | 1. Send chat message<br>2. Measure response | • AI response in <5 seconds<br>• Loading indicator shown during wait | ☐ | |

### 12.2 Concurrent Usage

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 12.2.1 | Multiple tabs | 1. Open app in 2+ tabs<br>2. Perform actions in each | • Actions sync across tabs<br>OR isolated (acceptable)<br>• No data corruption | ☐ | |
| 12.2.2 | Rapid quest acceptance | 1. Accept quests rapidly<br>2. Check quest count | • Never exceeds 3 active<br>• Race conditions handled | ☐ | |

---

## 13. RESPONSIVE DESIGN

### 13.1 Mobile (Phone)

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 13.1.1 | Mobile navigation | 1. Open site on mobile (or resize browser to <768px)<br>2. Check navigation | • Hamburger menu OR bottom nav<br>• All pages accessible | ☐ | |
| 13.1.2 | Mobile dashboard | 1. View /dashboard on mobile | • Progress bar visible<br>• Quest cards stack vertically<br>• Readable text, tappable buttons | ☐ | |
| 13.1.3 | Mobile quest detail | 1. View quest detail on mobile | • Full instructions readable<br>• Tools/templates accessible<br>• "Mark done" button reachable | ☐ | |
| 13.1.4 | Mobile chat | 1. Open chat on mobile | • Chat panel overlays (or takes full screen)<br>• Input field visible<br>• History scrollable | ☐ | |
| 13.1.5 | Mobile onboarding | 1. Complete onboarding on mobile | • All steps accessible<br>• Form fields usable<br>• No horizontal scroll | ☐ | |

### 13.2 Tablet

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 13.2.1 | Tablet layout (768-1024px) | 1. Resize to tablet width<br>2. Check all major pages | • Layout adapts (2-column where appropriate)<br>• No broken UI elements | ☐ | |

---

## 14. ACCESSIBILITY

### 14.1 Keyboard Navigation

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 14.1.1 | Tab through page | 1. Use Tab key to navigate<br>2. Try to reach all interactive elements | • All buttons/links/inputs reachable<br>• Focus indicator visible | ☐ | |
| 14.1.2 | Skip to content | 1. Tab from top of page | • Skip link appears<br>• Jumps to main content | ☐ | If implemented |
| 14.1.3 | Modal keyboard trap | 1. Open modal (e.g. quest detail)<br>2. Try to tab outside | • Focus stays within modal<br>• Can close with Esc key | ☐ | |

### 14.2 Screen Reader

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 14.2.1 | Screen reader test (NVDA/JAWS) | 1. Enable screen reader<br>2. Navigate dashboard | • All content announced<br>• Buttons have labels<br>• Images have alt text | ☐ | SPEC §14 mentions WCAG but requires expert review |
| 14.2.2 | Form labels | 1. Navigate onboarding form with screen reader | • All inputs have associated labels<br>• Validation errors announced | ☐ | |

### 14.3 Color Contrast

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 14.3.1 | Contrast ratio check | 1. Use browser extension (e.g. axe DevTools)<br>2. Check all pages | • Text contrast ≥4.5:1 (WCAG AA)<br>• Large text ≥3:1 | ☐ | |
| 14.3.2 | Dark mode contrast | 1. Enable dark mode (if implemented)<br>2. Check contrast | • Still meets WCAG AA standards | ☐ | |

---

## 15. SECURITY

### 15.1 Authentication Security

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 15.1.1 | Password strength | 1. Try weak password during signup | • Rejected with clear message | ☐ | |
| 15.1.2 | SQL injection attempt | 1. Enter SQL in login/signup fields (e.g. `' OR '1'='1`) | • Treated as literal string<br>• No database error/unauthorized access | ☐ | |
| 15.1.3 | XSS attempt | 1. Enter `<script>alert('XSS')</script>` in text fields<br>2. Submit | • Script not executed<br>• Rendered as plain text | ☐ | |

### 15.2 Authorization & RLS

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 15.2.1 | Access other founder's data | 1. Inspect network requests<br>2. Try to fetch `/api/founders/[other-founder-id]` | • 403 Forbidden<br>OR no data returned | ☐ | |
| 15.2.2 | RLS policy enforcement | 1. In Supabase SQL editor, query founders table as anon user | • Only own data visible<br>• Other founders' rows inaccessible | ☐ | SPEC §19 RLS |
| 15.2.3 | Admin-only routes | 1. Log in as normal founder<br>2. Try to access /admin/* | • 403 or redirect to /dashboard | ☐ | |

### 15.3 API Security

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 15.3.1 | CORS headers | 1. Check API response headers | • CORS configured for allowed origins only | ☐ | |
| 15.3.2 | Rate limiting | 1. Make 100+ rapid API requests | • Rate limit triggered (if implemented)<br>• 429 status returned | ☐ | May not be implemented |
| 15.3.3 | Cron secret validation | 1. Call /api/cron/weekly-recap without correct `CRON_SECRET` header | • 401 Unauthorized | ☐ | SETUP.md §7 |

---

## 16. DATA INTEGRITY

### 16.1 Database Constraints

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 16.1.1 | Unique email constraint | 1. Manually insert duplicate email in auth.users via SQL | • Database rejects (unique constraint) | ☐ | |
| 16.1.2 | Foreign key integrity | 1. Try to create quest without valid founder_id | • Database rejects (FK constraint) | ☐ | |
| 16.1.3 | Non-negative customer count | 1. Try to set current_customer_count to -1 | • Database rejects OR app validates before saving | ☐ | Check constraint in schema |

### 16.2 Concurrency

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 16.2.1 | Concurrent quest acceptance | 1. Open 2 browser tabs<br>2. Accept quest in both simultaneously | • Only 1 succeeds<br>OR both succeed but total ≤3 active | ☐ | Race condition test |
| 16.2.2 | Concurrent customer logging | 1. Log customer in 2 tabs at same time | • Both logged OR race-handled cleanly<br>• Count increments correctly | ☐ | |

---

## 17. AUTOMATED TESTS

### 17.1 End-to-End Tests
**Command:** `npm run test:e2e`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 17.1.1 | Run golden path test | 1. Ensure `.env.local` fully configured<br>2. Run `npm run test:e2e` | • Test passes:<br>  - Signup<br>  - Onboarding<br>  - Dashboard load<br>  - Accept quest<br>  - Settings<br>  - Logout<br>• Test user cleaned up after | ☐ | `e2e/golden-path.spec.ts` |
| 17.1.2 | Test user creation | 1. Check `e2e/global-setup.ts`<br>2. Run tests | • Test user created before tests<br>• Reused if exists<br>• No conflict with manual signups | ☐ | |

### 17.2 AI Quality Check
**Command:** `npm run golden-set`

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 17.2.1 | Golden-set check | 1. Run `npm run golden-set`<br>2. Review printed quest output | • 3 sample founders get personalized quests<br>• Quest text includes founder details<br>• No fabricated facts<br>• High quality output | ☐ | SPEC §17, `scripts/golden-set-check.ts` |

---

## 18. DEPLOYMENT & PRODUCTION READINESS

### 18.1 Build & Deploy

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 18.1.1 | Local build | 1. Run `npm run build` | • Build succeeds<br>• No TypeScript errors<br>• No lint errors | ☐ | |
| 18.1.2 | Production build check | 1. Run `npm run build`<br>2. Run `npm start`<br>3. Test in browser | • App works in production mode<br>• No dev-only features break | ☐ | |
| 18.1.3 | Deploy to Vercel | 1. Push to Vercel<br>2. Check deployed URL | • Deployment succeeds<br>• All env vars set<br>• App accessible | ☐ | SETUP.md §11 |

### 18.2 Environment Variables

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 18.2.1 | Missing env var | 1. Remove `GEMINI_API_KEY` from `.env.local`<br>2. Try quest generation | • Graceful fallback OR clear error message<br>• App doesn't crash | ☐ | |
| 18.2.2 | All required env vars | 1. Check `.env.example`<br>2. Verify all are in `.env.local` | • All required vars present<br>• App fully functional | ☐ | |

### 18.3 Monitoring & Logging

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 18.3.1 | Check server logs | 1. Trigger various actions<br>2. Check Vercel logs or local terminal | • Errors logged<br>• No sensitive data (passwords, API keys) in logs | ☐ | |
| 18.3.2 | Error boundaries | 1. Force a React error (e.g. throw in component)<br>2. Check UI | • Error boundary catches error<br>• User-friendly error page shown<br>• App doesn't white-screen | ☐ | |

---

## 19. WEEKLY CRON JOB

### 19.1 Weekly Recap Email
**Trigger:** GitHub Actions or manual curl

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 19.1.1 | Manual cron trigger | 1. Trigger GitHub Actions "Weekly Recap" workflow manually<br>2. Check email inbox | • Weekly recap email sent to all active founders<br>• Email includes: customers acquired this week, XP gained, quests completed | ☐ | SETUP.md §7, §9 |
| 19.1.2 | Cron authentication | 1. Call `/api/cron/weekly-recap` without `CRON_SECRET` header | • 401 Unauthorized | ☐ | |
| 19.1.3 | Cron on schedule | 1. Wait for Monday 14:00 UTC<br>2. Check email | • Automatic weekly recap sent | ☐ | Hard to test without waiting |

---

## 20. CROSS-BROWSER COMPATIBILITY

### 20.1 Browser Testing

| # | Browser | Version | Test Result | Notes |
|---|---------|---------|-------------|-------|
| 20.1.1 | Chrome | Latest | ☐ Pass / ☐ Fail | |
| 20.1.2 | Firefox | Latest | ☐ Pass / ☐ Fail | |
| 20.1.3 | Safari | Latest | ☐ Pass / ☐ Fail | |
| 20.1.4 | Edge | Latest | ☐ Pass / ☐ Fail | |
| 20.1.5 | Mobile Safari | iOS 15+ | ☐ Pass / ☐ Fail | |
| 20.1.6 | Mobile Chrome | Android 10+ | ☐ Pass / ☐ Fail | |

**Test at minimum:** signup, onboarding, dashboard, quest acceptance, chat, billing

---

## TEST SUMMARY

**Total Test Cases:** ~250+  
**Tested by:** ___________________  
**Test Date:** ___________________  

### Pass/Fail Summary

| Section | Total | Passed | Failed | Skipped | % Pass |
|---------|-------|--------|--------|---------|--------|
| 1. Authentication | | | | | |
| 2. Onboarding | | | | | |
| 3. Dashboard | | | | | |
| 4. Quest System | | | | | |
| 5. Growth Profile | | | | | |
| 6. AI Chat | | | | | |
| 7. Notifications | | | | | |
| 8. Settings | | | | | |
| 9. Subscription | | | | | |
| 10. Admin Tools | | | | | |
| 11. Edge Cases | | | | | |
| 12. Performance | | | | | |
| 13. Responsive | | | | | |
| 14. Accessibility | | | | | |
| 15. Security | | | | | |
| 16. Data Integrity | | | | | |
| 17. Automated Tests | | | | | |
| 18. Deployment | | | | | |
| 19. Cron Job | | | | | |
| 20. Cross-Browser | | | | | |
| **TOTAL** | | | | | |

---

## CRITICAL ISSUES LOG

| # | Test Case ID | Issue Description | Severity | Status | Notes |
|---|--------------|-------------------|----------|--------|-------|
| 1 | | | High/Med/Low | Open/Fixed | |
| 2 | | | High/Med/Low | Open/Fixed | |
| 3 | | | High/Med/Low | Open/Fixed | |

**Severity Levels:**
- **High:** Blocks core functionality, prevents testing other features
- **Medium:** Impacts user experience but has workaround
- **Low:** Minor UI/UX issue, edge case

---

## TESTING NOTES

### Test Environment
- **OS:** 
- **Node Version:** 
- **npm Version:** 
- **Browser(s):** 
- **Screen Resolution:** 

### Test Data
- **Test Founder Email:** 
- **Test Admin Email:** 
- **Stripe Test Cards Used:** 4242 4242 4242 4242
- **Supabase Project:** 

### Additional Notes


---

**END OF TEST PLAN**
