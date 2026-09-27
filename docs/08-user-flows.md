# Phase 6: User Flows

**Document Version:** 1.0  
**Date:** September 20, 2026  
**Status:** Draft for Review

---

## PURPOSE

This document defines detailed screen-by-screen flows for every major interaction in Get100 Customers, including:
- Screen purpose and entry points
- Available actions and navigation
- Conditions and state variations
- Loading, empty, error, and success states
- Data displayed and submitted
- All state transitions

This builds on the high-level journeys from Phase 5 with implementation-level detail.

---

## FLOW NOTATION

```
[SCREEN NAME]
├─ Purpose: What this screen accomplishes
├─ Entry Points: How user gets here
├─ Layout: Main elements on screen
├─ Actions: What user can do
├─ States: Different variations of this screen
│  ├─ Loading
│  ├─ Empty
│  ├─ Error
│  └─ Success
├─ Navigation: Where actions lead
└─ Data: What's displayed/submitted
```

---

## FLOW 1: AUTHENTICATION

### Screen 1.1: Landing Page (Marketing)

```
[LANDING PAGE]
├─ Purpose: Introduce product, drive signups
├─ Entry Points:
│  └─ Direct URL (marketing, ads, referrals)
├─ Layout:
│  ├─ Header: Logo, "Log In" link
│  ├─ Hero: Value proposition, "Get Started" CTA
│  ├─ Features: Product benefits
│  ├─ Social proof: Testimonials (if available)
│  └─ Footer: Links, legal
├─ Actions:
│  ├─ [Get Started] → Screen 1.2 (Signup)
│  └─ [Log In] → Screen 1.3 (Login)
├─ States: Standard (no variations)
└─ Data Displayed: Marketing copy
```

### Screen 1.2: Signup

```
[SIGNUP SCREEN]
├─ Purpose: Create new account
├─ Entry Points:
│  ├─ Landing page "Get Started" button
│  └─ Login screen "Don't have an account?" link
├─ Layout:
│  ├─ Header: Logo
│  ├─ Form:
│  │  ├─ Email field (required)
│  │  ├─ Password field (required, show/hide toggle)
│  │  ├─ Password requirements shown below field
│  │  ├─ "Create Account" button
│  │  └─ "Already have an account? Log in" link
│  └─ Optional: "Or sign up with Google" button
├─ Actions:
│  ├─ [Enter email] → Validate format
│  ├─ [Enter password] → Validate requirements (8+ chars, letter+number)
│  ├─ [Create Account] → Attempt signup
│  ├─ [Sign up with Google] → OAuth flow
│  └─ [Log in link] → Screen 1.3 (Login)
├─ States:
│  ├─ Default: Empty form
│  ├─ Validation Errors:
│  │  ├─ "Please enter a valid email"
│  │  └─ "Password must be at least 8 characters with letters and numbers"
│  ├─ Loading: "Creating your account..." (button disabled, spinner)
│  ├─ Error: "Email already in use" or "Something went wrong, try again"
│  └─ Success: Redirect to Screen 1.4 (Email Verification)
├─ Navigation:
│  ├─ Success → Screen 1.4 (Email Verification)
│  ├─ "Log in" link → Screen 1.3 (Login)
│  └─ Google OAuth success → Screen 2.1 (Onboarding Welcome)
└─ Data Submitted:
   ├─ email (string, validated format)
   └─ password (string, hashed before storage)
```

### Screen 1.3: Login

```
[LOGIN SCREEN]
├─ Purpose: Authenticate existing user
├─ Entry Points:
│  ├─ Landing page "Log In" link
│  ├─ Signup screen "Log in" link
│  └─ Session expiration
├─ Layout:
│  ├─ Header: Logo
│  ├─ Form:
│  │  ├─ Email field (required)
│  │  ├─ Password field (required, show/hide toggle)
│  │  ├─ "Forgot password?" link
│  │  ├─ "Log In" button
│  │  └─ "Don't have an account? Sign up" link
│  └─ Optional: "Or log in with Google" button
├─ Actions:
│  ├─ [Enter credentials] → Validate
│  ├─ [Log In] → Attempt authentication
│  ├─ [Log in with Google] → OAuth flow
│  ├─ [Forgot password?] → Screen 1.5 (Password Reset)
│  └─ [Sign up link] → Screen 1.2 (Signup)
├─ States:
│  ├─ Default: Empty form
│  ├─ Loading: "Logging in..." (button disabled, spinner)
│  ├─ Error: "Invalid email or password" or "Account not found"
│  └─ Success: Redirect based on account state
├─ Navigation:
│  ├─ Success + email not verified → Screen 1.4 (Email Verification)
│  ├─ Success + not onboarded → Screen 2.1 (Onboarding Welcome)
│  ├─ Success + onboarded + trial active → Screen 3.1 (Dashboard)
│  ├─ Success + onboarded + trial expired → Screen 10.1 (Paywall)
│  └─ Success + onboarded + subscription active → Screen 3.1 (Dashboard)
└─ Data Submitted:
   ├─ email (string)
   └─ password (string)
```

### Screen 1.4: Email Verification

```
[EMAIL VERIFICATION SCREEN]
├─ Purpose: Confirm email address
├─ Entry Points:
│  └─ After successful signup (Screen 1.2)
├─ Layout:
│  ├─ Header: Logo
│  ├─ Message:
│  │  ├─ "Check your email"
│  │  ├─ "We sent a verification link to [email]"
│  │  └─ "Click the link to continue"
│  ├─ "Didn't receive it? Resend" button
│  └─ "Wrong email? Change it" link
├─ Actions:
│  ├─ [Resend verification] → Send new email, show confirmation
│  ├─ [Change email] → Return to Screen 1.2 with pre-filled email
│  └─ [Click link in email] → Verify token, redirect
├─ States:
│  ├─ Default: Waiting for verification
│  ├─ Resend Success: "Email sent! Check your inbox"
│  ├─ Resend Error: "Couldn't send email, try again"
│  └─ Verified: Redirect to Screen 2.1 (Onboarding)
├─ Navigation:
│  └─ Email link clicked + verified → Screen 2.1 (Onboarding Welcome)
└─ Data: email address displayed
```

### Screen 1.5: Password Reset

```
[PASSWORD RESET REQUEST SCREEN]
├─ Purpose: Initiate password reset flow
├─ Entry Points:
│  └─ Login screen "Forgot password?" link
├─ Layout:
│  ├─ Header: Logo
│  ├─ Message: "Reset your password"
│  ├─ Email field (required)
│  ├─ "Send reset link" button
│  └─ "Back to login" link
├─ Actions:
│  ├─ [Enter email] → Validate format
│  ├─ [Send reset link] → Send password reset email
│  └─ [Back to login] → Screen 1.3 (Login)
├─ States:
│  ├─ Default: Empty form
│  ├─ Loading: "Sending reset link..."
│  ├─ Success: "Check your email for reset instructions"
│  └─ Error: "Couldn't send email, try again"
├─ Navigation:
│  ├─ Success → Stay on screen with success message
│  ├─ Email link clicked → Screen 1.6 (Reset Password Form)
│  └─ "Back to login" → Screen 1.3 (Login)
└─ Data Submitted: email (string)
```

### Screen 1.6: Reset Password Form

```
[RESET PASSWORD FORM]
├─ Purpose: Set new password
├─ Entry Points:
│  └─ Password reset email link (with token)
├─ Layout:
│  ├─ Header: Logo
│  ├─ Message: "Create a new password"
│  ├─ New password field (required, show/hide toggle)
│  ├─ Confirm password field (required, show/hide toggle)
│  ├─ Password requirements shown
│  └─ "Reset password" button
├─ Actions:
│  ├─ [Enter passwords] → Validate requirements and match
│  └─ [Reset password] → Update password
├─ States:
│  ├─ Default: Empty form
│  ├─ Validation Errors:
│  │  ├─ "Password must be at least 8 characters..."
│  │  └─ "Passwords don't match"
│  ├─ Loading: "Updating password..."
│  ├─ Error: "Reset link expired" or "Something went wrong"
│  └─ Success: "Password updated! Redirecting to login..."
├─ Navigation:
│  └─ Success → Screen 1.3 (Login)
└─ Data Submitted:
   ├─ token (from URL)
   ├─ new_password (string, hashed)
   └─ confirm_password (string, must match)
```

---

## FLOW 2: ONBOARDING

### Screen 2.1: Onboarding Welcome

```
[ONBOARDING WELCOME SCREEN]
├─ Purpose: Introduce onboarding, set expectations
├─ Entry Points:
│  ├─ After email verification (Screen 1.4)
│  ├─ After first login (Screen 1.3)
│  └─ After OAuth signup
├─ Layout:
│  ├─ Header: Logo, progress indicator (Step 1/8)
│  ├─ Welcome message:
│  │  ├─ "Welcome to Get100!"
│  │  ├─ "Let's build your personalized growth plan"
│  │  └─ "This takes about 3 minutes"
│  └─ "Let's go" button
├─ Actions:
│  └─ [Let's go] → Screen 2.2 (Company Name)
├─ States: Standard (no variations)
├─ Navigation:
│  └─ "Let's go" → Screen 2.2
└─ Data: None
```

### Screen 2.2: Company Name

```
[ONBOARDING: COMPANY NAME]
├─ Purpose: Collect company name
├─ Entry Points:
│  └─ Screen 2.1 (Welcome) "Let's go" button
├─ Layout:
│  ├─ Header: Logo, progress indicator (Step 1/8)
│  ├─ Question: "What's your company name?"
│  ├─ Text input (required)
│  ├─ "Next" button
│  └─ "Skip" link (saves empty, continues)
├─ Actions:
│  ├─ [Enter company name] → Enable "Next" button
│  ├─ [Next] → Save and continue to Screen 2.3
│  └─ [Skip] → Continue to Screen 2.3 (null value)
├─ States:
│  ├─ Default: Empty input, "Next" disabled
│  ├─ Entered: Input has value, "Next" enabled
│  ├─ Loading: "Saving..." (brief)
│  └─ Error: "Couldn't save, try again"
├─ Navigation:
│  └─ Next/Skip → Screen 2.3 (Industry)
└─ Data Submitted:
   └─ company_name (string, optional)
```

### Screen 2.3: Industry

```
[ONBOARDING: INDUSTRY]
├─ Purpose: Collect business model/industry
├─ Entry Points:
│  └─ Screen 2.2 (Company Name) "Next"
├─ Layout:
│  ├─ Header: Progress indicator (Step 2/8)
│  ├─ Question: "What industry are you in?"
│  ├─ Dropdown or button grid:
│  │  ├─ B2B SaaS
│  │  ├─ B2C SaaS / App
│  │  ├─ Services / Agency / Consulting
│  │  ├─ DTC / E-commerce
│  │  └─ Other (text input appears)
│  ├─ "Next" button
│  └─ "Back" link
├─ Actions:
│  ├─ [Select industry] → Enable "Next"
│  ├─ [Select "Other"] → Show text input
│  ├─ [Next] → Save and continue
│  └─ [Back] → Screen 2.2
├─ States:
│  ├─ Default: No selection, "Next" disabled
│  ├─ Selected: Industry chosen, "Next" enabled
│  ├─ Other Selected: Text input shown
│  └─ Loading: Brief save state
├─ Navigation:
│  ├─ Next → Screen 2.4 (Product Description)
│  └─ Back → Screen 2.2
└─ Data Submitted:
   └─ industry (enum or string)
```

### Screen 2.4: Product Description

```
[ONBOARDING: PRODUCT DESCRIPTION]
├─ Purpose: Collect one-line product description
├─ Entry Points:
│  └─ Screen 2.3 (Industry) "Next"
├─ Layout:
│  ├─ Header: Progress indicator (Step 3/8)
│  ├─ Question: "In one line, what does your product/service do?"
│  ├─ Text input (required, placeholder: "AI-powered resume builder for job seekers")
│  ├─ Character counter (150 max)
│  ├─ "Next" button
│  └─ "Back" link
├─ Actions:
│  ├─ [Enter description] → Enable "Next" when >10 chars
│  ├─ [Next] → Save and continue
│  └─ [Back] → Screen 2.3
├─ States:
│  ├─ Default: Empty, "Next" disabled
│  ├─ Too Short: <10 chars, "Next" disabled, hint shown
│  ├─ Valid: 10-150 chars, "Next" enabled
│  ├─ Too Long: >150 chars, character count red, "Next" disabled
│  └─ Loading: Brief save state
├─ Navigation:
│  ├─ Next → Screen 2.5 (Target Customer)
│  └─ Back → Screen 2.3
└─ Data Submitted:
   └─ product_description (string, 10-150 chars)
```

### Screen 2.5: Target Customer (ICP)

```
[ONBOARDING: TARGET CUSTOMER]
├─ Purpose: Collect ideal customer profile
├─ Entry Points:
│  └─ Screen 2.4 (Product Description) "Next"
├─ Layout:
│  ├─ Header: Progress indicator (Step 4/8)
│  ├─ Question: "Who is your ideal customer?"
│  ├─ Text area (required, placeholder: "Recent college grads looking for their first job")
│  ├─ Helper text: "Think about demographics (age, role, location) and what problem they have"
│  ├─ "Next" button
│  └─ "Back" link
├─ Actions:
│  ├─ [Enter ICP] → Enable "Next" when >10 chars
│  ├─ [Next] → Save and continue
│  └─ [Back] → Screen 2.4
├─ States:
│  ├─ Default: Empty, "Next" disabled
│  ├─ Valid: >10 chars, "Next" enabled
│  └─ Loading: Brief save state
├─ Navigation:
│  ├─ Next → Screen 2.6 (Business Stage)
│  └─ Back → Screen 2.4
└─ Data Submitted:
   └─ icp_description (string)
```

### Screen 2.6: Business Stage

```
[ONBOARDING: BUSINESS STAGE]
├─ Purpose: Determine where founder is in their journey
├─ Entry Points:
│  └─ Screen 2.5 (Target Customer) "Next"
├─ Layout:
│  ├─ Header: Progress indicator (Step 5/8)
│  ├─ Question: "What stage are you at?"
│  ├─ Radio buttons or cards:
│  │  ├─ Just an idea (no product yet)
│  │  ├─ MVP built (not launched)
│  │  ├─ Launched (no customers)
│  │  └─ Have some customers
│  ├─ "Next" button
│  └─ "Back" link
├─ Actions:
│  ├─ [Select stage] → Enable "Next"
│  ├─ [Next] → Save and continue
│  └─ [Back] → Screen 2.5
├─ States:
│  ├─ Default: No selection, "Next" disabled
│  ├─ Selected: Stage chosen, "Next" enabled
│  └─ Loading: Brief save state
├─ Navigation:
│  ├─ Next → Screen 2.7 (Customer Count)
│  └─ Back → Screen 2.5
└─ Data Submitted:
   └─ stage (enum: idea | mvp | launched | have_customers)
```

### Screen 2.7: Customer Count

```
[ONBOARDING: CUSTOMER COUNT]
├─ Purpose: Track starting point for progress
├─ Entry Points:
│  └─ Screen 2.6 (Business Stage) "Next"
├─ Layout:
│  ├─ Header: Progress indicator (Step 6/8)
│  ├─ Question: "How many customers do you have right now?"
│  ├─ Number input (default: 0, min: 0, max: 9999)
│  ├─ Helper text: "Enter 0 if you haven't acquired any yet"
│  ├─ "Next" button
│  └─ "Back" link
├─ Actions:
│  ├─ [Enter count] → Validate number
│  ├─ [Next] → Save and continue
│  └─ [Back] → Screen 2.6
├─ States:
│  ├─ Default: 0, "Next" enabled
│  ├─ Valid: Any non-negative number, "Next" enabled
│  ├─ Invalid: Negative or non-number, error shown
│  └─ Loading: Brief save state
├─ Navigation:
│  ├─ Next → Screen 2.8 (Channels Tried)
│  └─ Back → Screen 2.6
└─ Data Submitted:
   └─ current_customer_count (integer, ≥0)
```

### Screen 2.8: Channels Tried

```
[ONBOARDING: CHANNELS TRIED]
├─ Purpose: Understand previous acquisition attempts
├─ Entry Points:
│  └─ Screen 2.7 (Customer Count) "Next"
├─ Layout:
│  ├─ Header: Progress indicator (Step 7/8)
│  ├─ Question: "What customer acquisition tactics have you tried?"
│  ├─ Multi-select checkboxes:
│  │  ├─ Cold email
│  │  ├─ Cold calling
│  │  ├─ Social media (LinkedIn, Twitter, etc.)
│  │  ├─ Content marketing (blogs, videos, etc.)
│  │  ├─ Paid ads (Google, Facebook, etc.)
│  │  ├─ Online communities (Reddit, forums, etc.)
│  │  ├─ Partnerships / affiliates
│  │  ├─ Referrals
│  │  ├─ Events / conferences
│  │  └─ None yet
│  ├─ "Next" button (always enabled, can select none)
│  └─ "Back" link
├─ Actions:
│  ├─ [Select channels] → Update selection
│  ├─ [Select "None yet"] → Deselect all others
│  ├─ [Select any other] → Deselect "None yet"
│  ├─ [Next] → Save and continue
│  └─ [Back] → Screen 2.7
├─ States:
│  ├─ Default: "None yet" pre-selected if customer_count = 0
│  ├─ Multiple Selected: Multiple channels checked
│  └─ Loading: Brief save state
├─ Navigation:
│  ├─ Next → Screen 2.9 (Optional Doc Upload)
│  └─ Back → Screen 2.7
└─ Data Submitted:
   └─ channels_tried (array of enum)
```

### Screen 2.9: Optional Doc/URL Upload

```
[ONBOARDING: OPTIONAL UPLOAD]
├─ Purpose: Allow founder to provide additional context
├─ Entry Points:
│  └─ Screen 2.8 (Channels Tried) "Next"
├─ Layout:
│  ├─ Header: Progress indicator (Step 8/8)
│  ├─ Message: "Want to speed this up? (Optional)"
│  ├─ Two options:
│  │  ├─ URL input: "Paste your website URL"
│  │  └─ File upload: "Or upload your pitch deck/notes"
│  ├─ "Analyze" button (appears after input/upload)
│  ├─ "Skip" button (always visible)
│  └─ "Back" link
├─ Actions:
│  ├─ [Enter URL] → Validate format, enable "Analyze"
│  ├─ [Upload file] → Validate file type (PDF, DOCX, TXT), enable "Analyze"
│  ├─ [Analyze] → Extract context, update profile
│  ├─ [Skip] → Continue without upload
│  └─ [Back] → Screen 2.8
├─ States:
│  ├─ Default: Empty, only "Skip" enabled
│  ├─ URL Entered: Valid URL, "Analyze" enabled
│  ├─ File Uploaded: Valid file, "Analyze" enabled
│  ├─ Analyzing: "Extracting context..." (spinner, progress indicator)
│  │  └─ Shows: "AI is reading your [URL/document]..."
│  ├─ Analysis Complete: "Got it! Your profile has been enriched."
│  ├─ Analysis Error: "Couldn't analyze [URL/file]. You can skip or try another."
│  └─ Success: Auto-advance after 2 seconds
├─ Navigation:
│  ├─ Analyze success → Screen 2.10 (Preparing Quests)
│  ├─ Skip → Screen 2.10 (Preparing Quests)
│  └─ Back → Screen 2.8
└─ Data Submitted:
   ├─ document_url (string, optional)
   ├─ document_file (file, optional)
   └─ extracted_summary (string, AI-generated)
```

### Screen 2.10: Preparing Quests (Loading)

```
[ONBOARDING: PREPARING QUESTS]
├─ Purpose: Loading state while AI generates initial quests
├─ Entry Points:
│  └─ Screen 2.9 (Optional Upload) "Analyze" or "Skip"
├─ Layout:
│  ├─ Header: Logo (no back button)
│  ├─ Loading animation (spinner or progress animation)
│  ├─ Message: "Your AI coach is preparing your first quests..."
│  └─ Progress indicator (animated, not % complete)
├─ Actions: None (no user interaction, automated transition)
├─ States:
│  ├─ Loading: Generating quests (typically 5-15 seconds)
│  │  └─ Background: AI calls to generate 3 initial quests
│  ├─ Success: Quests generated, auto-redirect
│  └─ Error: "Something went wrong. Retrying..." (auto-retry up to 3 times)
├─ Navigation:
│  ├─ Success → Screen 3.1 (Dashboard - First Time)
│  └─ Error after 3 retries → Show error with "Try again" button
└─ Data: None (backend quest generation)
```

---

## FLOW 3: MAIN DASHBOARD

### Screen 3.1: Dashboard (Standard View)

```
[MAIN DASHBOARD]
├─ Purpose: Central hub showing progress, active quests, stats
├─ Entry Points:
│  ├─ After successful login (Screen 1.3)
│  ├─ After onboarding complete (Screen 2.10)
│  ├─ Any in-app navigation "Dashboard" link
│  └─ Deep links from notifications
├─ Layout:
│  ├─ Header:
│  │  ├─ Logo
│  │  ├─ Navigation: Dashboard (active) | Quest Journal | Settings
│  │  ├─ Chat bubble (floating, bottom right)
│  │  └─ User menu (profile icon)
│  ├─ Main Content:
│  │  ├─ Welcome message: "Welcome back, [Name]!"
│  │  ├─ Progress section:
│  │  │  ├─ Large progress bar: [23] / 100 customers
│  │  │  ├─ Level & XP: "Level 4 • 1,250 / 2,000 XP"
│  │  │  └─ Streak: "5-day streak 🔥"
│  │  ├─ Active Quests section:
│  │  │  ├─ Title: "Your Active Quests"
│  │  │  ├─ Quest cards (1-3 displayed):
│  │  │  │  ├─ Quest title
│  │  │  │  ├─ Quest description (1-2 lines)
│  │  │  │  ├─ XP reward badge
│  │  │  │  ├─ Suggested timeframe (e.g., "Complete in 3-5 days")
│  │  │  │  └─ Action button: "View Quest" or "Mark as Done"
│  │  │  └─ Empty slot: "Complete a quest to unlock next"
│  │  └─ Growth Insights panel:
│  │       ├─ Title: "What's Working"
│  │       ├─ Top channel: "Cold email (12 customers, 35% response)"
│  │       └─ Recent win: "You acquired 2 customers this week!"
│  ├─ Sidebar (optional):
│  │  ├─ Next milestone: "10 more to reach 50 customers"
│  │  └─ Weekly recap: "You completed 3 quests this week"
│  └─ Footer: Support link, changelog
├─ Actions:
│  ├─ [Click quest card] → Screen 4.1 (Quest Detail)
│  ├─ [Mark as Done] → Screen 4.6 (Result Logging)
│  ├─ [Quest Journal] → Screen 5.1 (Quest Journal)
│  ├─ [Settings] → Screen 9.1 (Settings)
│  ├─ [Chat bubble] → Screen 6.1 (AI Coach Chat)
│  ├─ [User menu] → Dropdown with Profile, Logout
│  └─ [I got a customer] → Screen 8.1 (Log Customer)
├─ States:
│  ├─ First Time: Welcome overlay + tutorial highlights
│  ├─ Standard: Normal view (described above)
│  ├─ No Active Quests: Empty state with "Get next quest" CTA
│  ├─ Milestone Reached: Celebration banner at top
│  ├─ Trial Ending: Banner "Trial ends in 3 days - Add payment"
│  ├─ Payment Failed: Banner "Payment issue - Update now"
│  └─ Loading: Skeleton loaders for all sections
├─ Navigation:
│  ├─ Quest card → Screen 4.1
│  ├─ Quest Journal → Screen 5.1
│  ├─ Settings → Screen 9.1
│  ├─ Chat → Screen 6.1
│  ├─ Log Customer → Screen 8.1
│  └─ Logout → Screen 1.3 (Login)
└─ Data Displayed:
   ├─ current_customer_count
   ├─ progress_to_next_milestone
   ├─ xp, level
   ├─ streak_days
   ├─ active_quests (array, max 3)
   ├─ growth_insights (from growth_profile)
   └─ notification_banners (if any)
```

### Screen 3.2: Dashboard (First Time - Welcome Overlay)

```
[DASHBOARD - FIRST TIME]
├─ Purpose: Onboard new user to dashboard, highlight key features
├─ Entry Points:
│  └─ First login after onboarding (Screen 2.10)
├─ Layout:
│  ├─ Base: Same as Screen 3.1
│  ├─ Overlay: Semi-transparent backdrop
│  ├─ Welcome modal:
│  │  ├─ "Welcome to your growth dashboard!"
│  │  ├─ Brief explanation of key areas:
│  │  │  ├─ "Your progress bar shows customers acquired"
│  │  │  ├─ "Active quests are your next steps"
│  │  │  └─ "Chat bubble for questions anytime"
│  │  └─ "Got it" button
├─ Actions:
│  └─ [Got it] → Dismiss overlay, show standard dashboard
├─ States:
│  └─ First Time Only: Overlay shown once, never again
├─ Navigation:
│  └─ "Got it" → Screen 3.1 (Standard Dashboard)
└─ Data: Same as Screen 3.1
```

### Screen 3.3: Dashboard (No Active Quests - Empty State)

```
[DASHBOARD - NO ACTIVE QUESTS]
├─ Purpose: Handle state when no quests are active
├─ Entry Points:
│  └─ User completed/skipped all quests, none pending
├─ Layout:
│  ├─ Header: Same as Screen 3.1
│  ├─ Progress section: Same as Screen 3.1
│  ├─ Active Quests section:
│  │  ├─ Empty state illustration
│  │  ├─ Message: "No active quests right now"
│  │  ├─ Sub-message: "Let me find your next best move..."
│  │  └─ "Get Next Quest" button
│  └─ Growth Insights: Same as Screen 3.1
├─ Actions:
│  └─ [Get Next Quest] → Trigger quest recommendation
├─ States:
│  ├─ Empty: Waiting for user action
│  ├─ Loading: "Finding your next quest..." (spinner)
│  ├─ Success: Quest appears in active quests section
│  └─ Error: "Couldn't generate quest, try again"
├─ Navigation:
│  └─ Success → Quest appears, user can click to view
└─ Data: None (triggers quest generation)
```

---

## FLOW 4: QUEST INTERACTIONS

### Screen 4.1: Quest Detail

```
[QUEST DETAIL SCREEN]
├─ Purpose: Show full quest information and tools
├─ Entry Points:
│  ├─ Dashboard quest card click (Screen 3.1)
│  ├─ Quest Journal quest click (Screen 5.1)
│  └─ Notification deep link
├─ Layout:
│  ├─ Header: Back button, quest title
│  ├─ Main Content:
│  │  ├─ Quest status badge: "Active" | "Suggested" | "Awaiting Report"
│  │  ├─ Quest title (large)
│  │  ├─ XP reward: "+50 XP"
│  │  ├─ Suggested timeframe: "Complete in 3-5 days"
│  │  ├─ "Why this quest" section:
│  │  │  └─ Personalized explanation of why this quest now
│  │  ├─ Instructions section:
│  │  │  ├─ Step-by-step list (numbered or checkboxes if sub_tasks exist)
│  │  │  └─ Each step with brief description
│  │  ├─ Tools & Templates section:
│  │  │  ├─ Title: "Your tools for this quest"
│  │  │  ├─ List of tools (links/downloads):
│  │  │  │  ├─ "Personalized cold email template"
│  │  │  │  ├─ "ICP worksheet"
│  │  │  │  └─ "Example outreach messages"
│  │  │  └─ Click to view/download
│  │  ├─ Success criteria section:
│  │  │  └─ What counts as completing this quest
│  │  └─ Action buttons:
│  │       ├─ Primary: "Start Quest" (if suggested)
│  │       ├─ Primary: "Mark as Done" (if active)
│  │       ├─ Secondary: "Not for me" (skip)
│  │       └─ Secondary: "Show other options"
│  ├─ Chat bubble: Available for questions
│  └─ Footer: Back to dashboard link
├─ Actions:
│  ├─ [Start Quest] → Status changes to "active", button changes to "Mark as Done"
│  ├─ [Mark as Done] → Screen 4.6 (Result Logging)
│  ├─ [Not for me] → Screen 4.3 (Skip Quest Dialog)
│  ├─ [Show other options] → Screen 4.4 (Alternative Quests)
│  ├─ [Click tool/template] → Screen 4.5 (Tool View) or download
│  ├─ [Back] → Screen 3.1 (Dashboard)
│  └─ [Chat bubble] → Screen 6.1 (AI Chat)
├─ States:
│  ├─ Suggested: "Start Quest" button, quest not yet active
│  ├─ Active: "Mark as Done" button, can log sub-task progress
│  ├─ Awaiting Report: "Log Results" button, reminder to report
│  ├─ Loading: Skeleton loader for content
│  └─ Error: "Couldn't load quest details, try again"
├─ Navigation:
│  ├─ Start Quest → Same screen (status updated)
│  ├─ Mark as Done → Screen 4.6
│  ├─ Not for me → Screen 4.3
│  ├─ Show other options → Screen 4.4
│  ├─ Tool click → Screen 4.5 or download
│  └─ Back → Screen 3.1
└─ Data Displayed:
   ├─ quest_id
   ├─ title
   ├─ description
   ├─ instructions (array)
   ├─ xp_value
   ├─ tools_provided (array of links/templates)
   ├─ success_criteria
   ├─ suggested_window
   └─ status
```

### Screen 4.2: Quest Detail (Sub-tasks Checklist)

```
[QUEST DETAIL - WITH SUB-TASKS]
├─ Purpose: Track progress through multi-step quest
├─ Entry Points:
│  └─ Screen 4.1 when quest has sub_tasks defined
├─ Layout:
│  ├─ Same as Screen 4.1, but Instructions section includes:
│  │  └─ Interactive checklist (checkboxes):
│  │       ├─ ☐ Sub-task 1: Description
│  │       ├─ ☐ Sub-task 2: Description
│  │       └─ ☑ Sub-task 3: Description (checked)
│  ├─ Progress indicator: "2 / 5 steps complete"
│  └─ Action buttons: Same as Screen 4.1
├─ Actions:
│  ├─ [Check sub-task] → Save progress, update count
│  ├─ [Uncheck sub-task] → Update progress
│  └─ All other actions same as Screen 4.1
├─ States:
│  ├─ In Progress: Some sub-tasks checked, not all
│  ├─ All Checked: All sub-tasks complete, "Mark as Done" highlighted
│  └─ Same loading/error states as Screen 4.1
├─ Navigation: Same as Screen 4.1
└─ Data:
   ├─ Same as Screen 4.1
   └─ sub_tasks (array with completion status)
```

### Screen 4.3: Skip Quest Dialog

```
[SKIP QUEST DIALOG]
├─ Purpose: Capture reason for skipping, surface alternatives
├─ Entry Points:
│  └─ Quest Detail "Not for me" button (Screen 4.1)
├─ Layout:
│  ├─ Modal overlay (over Screen 4.1)
│  ├─ Title: "Why skip this quest?"
│  ├─ Radio buttons (optional reason):
│  │  ├─ Too hard right now
│  │  ├─ Not relevant to my business
│  │  ├─ Already tried this
│  │  ├─ Don't have time
│  │  └─ Other (text input)
│  ├─ Actions:
│  │  ├─ "Skip this quest" button
│  │  ├─ "Show me alternatives" button
│  │  └─ "Cancel" link
├─ Actions:
│  ├─ [Select reason] → Enable action buttons
│  ├─ [Skip this quest] → Mark quest as skipped, update growth profile
│  ├─ [Show me alternatives] → Screen 4.4 (Alternative Quests)
│  └─ [Cancel] → Close dialog, return to Screen 4.1
├─ States:
│  ├─ Default: No reason selected, buttons enabled anyway
│  ├─ Loading: "Updating..." (brief)
│  └─ Success: Close dialog, return to dashboard with quest removed
├─ Navigation:
│  ├─ Skip → Screen 3.1 (Dashboard, quest removed from active)
│  ├─ Show alternatives → Screen 4.4
│  └─ Cancel → Screen 4.1
└─ Data Submitted:
   ├─ quest_id
   ├─ action: "skipped"
   └─ reason (string, optional)
```

### Screen 4.4: Alternative Quests

```
[ALTERNATIVE QUESTS SCREEN]
├─ Purpose: Show 2-3 alternative quest options
├─ Entry Points:
│  ├─ Quest Detail "Show other options" (Screen 4.1)
│  └─ Skip Quest Dialog "Show alternatives" (Screen 4.3)
├─ Layout:
│  ├─ Header: Back button, "Alternative Quests"
│  ├─ Message: "Here are other quests that might fit better:"
│  ├─ Quest cards (2-3 options):
│  │  ├─ Quest title
│  │  ├─ Brief description (2-3 lines)
│  │  ├─ XP reward
│  │  ├─ Timeframe
│  │  ├─ "Why this" (brief)
│  │  └─ "Choose this" button
│  └─ "None of these work" link
├─ Actions:
│  ├─ [Choose this] → Replace current quest, go to Screen 4.1 (new quest detail)
│  ├─ [None of these work] → Screen 6.1 (Chat) with context
│  └─ [Back] → Screen 4.1 (original quest)
├─ States:
│  ├─ Loading: "Finding alternatives..." (skeleton cards)
│  ├─ Standard: 2-3 quest cards displayed
│  ├─ Selecting: "Updating your quest log..." (brief loading)
│  └─ Error: "Couldn't load alternatives, try chat instead"
├─ Navigation:
│  ├─ Choose quest → Screen 4.1 (new quest detail)
│  ├─ None work → Screen 6.1 (Chat)
│  └─ Back → Screen 4.1 (original quest)
└─ Data Displayed:
   └─ alternative_quests (array of 2-3 quest objects)
```

### Screen 4.5: Tool/Template View

```
[TOOL/TEMPLATE VIEW]
├─ Purpose: Display personalized template or tool
├─ Entry Points:
│  └─ Quest Detail tool link click (Screen 4.1)
├─ Layout:
│  ├─ Header: Back button, tool name
│  ├─ Tool content:
│  │  ├─ For templates: Editable text area with personalized content
│  │  ├─ For worksheets: Fillable form
│  │  ├─ For examples: Read-only reference content
│  ├─ Actions:
│  │  ├─ "Copy to clipboard" button (for templates)
│  │  ├─ "Download" button (PDF/DOCX export)
│  │  ├─ "Edit" toggle (make content editable)
│  │  └─ "Save my version" (if edited)
├─ Actions:
│  ├─ [Copy] → Copy content to clipboard, show "Copied!" toast
│  ├─ [Download] → Generate file, trigger download
│  ├─ [Edit] → Make content editable
│  ├─ [Save my version] → Save edited version for reuse
│  └─ [Back] → Screen 4.1 (Quest Detail)
├─ States:
│  ├─ Loading: Skeleton/spinner while generating personalized content
│  ├─ View Mode: Content displayed, not editable
│  ├─ Edit Mode: Content editable in text area
│  ├─ Saving: "Saving your version..."
│  └─ Saved: "Saved! You can reuse this template anytime"
├─ Navigation:
│  └─ Back → Screen 4.1
└─ Data Displayed:
   ├─ tool_name
   ├─ tool_type (template | worksheet | example)
   ├─ content (personalized for founder's business)
   └─ edited_version (if user saved custom version)
```

### Screen 4.6: Result Logging

```
[RESULT LOGGING SCREEN]
├─ Purpose: Capture structured quest results
├─ Entry Points:
│  ├─ Quest Detail "Mark as Done" (Screen 4.1)
│  └─ Dashboard quest card "Mark as Done" (Screen 3.1)
├─ Layout:
│  ├─ Header: Back button, "Log Results"
│  ├─ Quest title reminder
│  ├─ Message: "Great! Let's capture what happened."
│  ├─ Structured questions (2-4, specific to quest type):
│  │  ├─ Example for outreach quest:
│  │  │  ├─ Q1: "How many people did you contact?" [Number input]
│  │  │  ├─ Q2: "How many responded?" [Number input]
│  │  │  ├─ Q3: "How many showed interest?" [Number input]
│  │  │  └─ Q4: "Did any become customers?" [Yes/No toggle + Count if yes]
│  │  ├─ Example for content quest:
│  │  │  ├─ Q1: "Did you publish the content?" [Yes/No]
│  │  │  ├─ Q2: "Where did you publish it?" [Text input]
│  │  │  └─ Q3: "What was the response?" [Text area]
│  ├─ Always-available question:
│  │  └─ "Any other notes or learnings?" [Text area, optional]
│  └─ "Submit Results" button
├─ Actions:
│  ├─ [Answer questions] → Fill form
│  ├─ [Submit Results] → Save results, trigger analysis
│  └─ [Back] → Screen 4.1 (results not saved)
├─ States:
│  ├─ Default: Empty form
│  ├─ Validation: Some required fields missing, show hints
│  ├─ Submitting: "Analyzing your results..." (spinner)
│  ├─ Success: Redirect to Screen 4.7 (Result Summary)
│  └─ Error: "Couldn't save results, try again"
├─ Navigation:
│  ├─ Submit success → Screen 4.7 (Result Summary)
│  └─ Back → Screen 4.1 (confirm discard if partially filled)
└─ Data Submitted:
   ├─ quest_id
   ├─ structured_answers (object, keys match result_questions)
   ├─ notes (string, optional)
   └─ timestamp
```

### Screen 4.7: Result Summary & Next Quest

```
[RESULT SUMMARY SCREEN]
├─ Purpose: Celebrate completion, show analysis, recommend next quest
├─ Entry Points:
│  └─ After submitting results (Screen 4.6)
├─ Layout:
│  ├─ Celebration section:
│  │  ├─ Animation: "Quest Complete!" 🎉
│  │  ├─ XP earned: "+50 XP"
│  │  ├─ New total: "Your XP: 1,300 / 2,000 (Level 4)"
│  │  └─ If milestone/level-up: Additional celebration
│  ├─ Analysis section:
│  │  ├─ Title: "What we learned"
│  │  ├─ AI-generated insights from results:
│  │  │  ├─ "Your cold email had a 40% response rate—that's great!"
│  │  │  ├─ "But zero conversions to customers. Let's work on your pitch."
│  │  │  └─ "Bottleneck: Response → Customer conversion"
│  │  └─ Growth profile updated indicator
│  ├─ Next Quest section:
│  │  ├─ Title: "What's next"
│  │  ├─ Recommended quest card:
│  │  │  ├─ Quest title
│  │  │  ├─ Why recommendation
│  │  │  ├─ XP reward
│  │  │  └─ "Accept" button
│  │  ├─ "Show other options" link
│  │  └─ "I'll choose later" link
│  └─ "Back to Dashboard" button
├─ Actions:
│  ├─ [Accept next quest] → Quest becomes active, redirect to Screen 4.1
│  ├─ [Show other options] → Screen 4.4 (Alternative Quests)
│  ├─ [I'll choose later] → Screen 3.1 (Dashboard)
│  └─ [Back to Dashboard] → Screen 3.1
├─ States:
│  ├─ Standard: Celebration + analysis + recommendation
│  ├─ Milestone: Extra celebration for 1st customer, 10/25/50/100, level-up
│  ├─ Loading Next Quest: Brief loading for recommendation generation
│  └─ Error generating next: "Couldn't generate recommendation" with "Try again"
├─ Navigation:
│  ├─ Accept → Screen 4.1 (new quest)
│  ├─ Show options → Screen 4.4
│  └─ Dashboard/Later → Screen 3.1
└─ Data Displayed:
   ├─ xp_earned
   ├─ new_xp_total, new_level
   ├─ ai_analysis (insights from result)
   ├─ recommended_next_quest
   └─ milestone_achieved (if any)
```

---

This is part 1 of the User Flows. The document is quite large. Should I:

1. **Continue with remaining flows** (Quest Journal, AI Chat, Customer Logging, Settings, Admin, Subscription)
2. **Save current progress and proceed to next phase** (Phase 7: Information Architecture)
3. **Focus on specific flows you want detailed next**

What's your preference?


---

## FLOW 5: QUEST JOURNAL (High-Level Summary)

### Screen 5.1: Quest Journal List
- **Purpose:** View history of all quests (completed, skipped, expired)
- **Layout:** List view with filters (All | Completed | Skipped), search bar, quest cards showing title, status, completion date, XP earned
- **Actions:** Click quest to view details, filter by status, search by title
- **States:** Loading, populated, empty (new user)
- **Navigation:** Click quest → Read-only quest detail view with results shown

### Screen 5.2: Quest History Detail
- **Purpose:** View past quest with logged results
- **Layout:** Quest info (title, description, tools used), results submitted, AI analysis, date completed
- **Actions:** View only (read-only), back to journal
- **Navigation:** Back → Screen 5.1

---

## FLOW 6: AI COACH CHAT (High-Level Summary)

### Screen 6.1: Chat Interface
- **Purpose:** Ask AI coach questions, get guidance, request quest changes
- **Layout:** Floating chat bubble that expands to chat panel (not full-screen), message history, input field, suggested prompts
- **Entry Points:** Chat bubble from any screen, notification deep link
- **Actions:** Send message, view history, close chat (minimizes to bubble)
- **States:** Empty (first time), conversation active, AI typing indicator, error (API failure)
- **Navigation:** Persistent across screens, stays open while navigating
- **Context Awareness:** AI knows current quest, founder profile, growth profile, recent results

### Chat Interaction Patterns
- **Request quest swap:** "I don't want to do this quest" → AI offers alternatives
- **Get help:** "How do I write a cold email?" → AI provides guidance + templates
- **Strategy advice:** "Growth has slowed, what should I do?" → AI analyzes growth profile, recommends actions
- **Why questions:** "Why did you recommend this quest?" → AI explains reasoning
- **Generate quests:** AI can propose new quests based on conversation

---

## FLOW 7: GROWTH INSIGHTS / ANALYTICS (High-Level Summary)

### Screen 7.1: Growth Insights Panel (Dashboard Widget)
- **Purpose:** Show what's working, bottlenecks, trends
- **Layout:** Card on dashboard showing:
  - Top performing channel (e.g., "Cold email: 12 customers, 35% response")
  - Recent wins ("You acquired 2 customers this week!")
  - Current bottleneck if identified
  - Trend direction (improving / plateau / declining)
- **Actions:** Click to expand to full analytics view (optional Fast-follow feature)
- **States:** Not enough data (early stage), populated, insights available
- **Data Source:** Derived from growth_profile table

### Screen 7.2: Full Analytics View (Fast-follow)
- **Purpose:** Detailed metrics and visualizations
- **Layout:** Charts showing customer acquisition over time, channel performance breakdown, conversion funnel, quest completion rates
- **Not required for Launch** - Dashboard widget sufficient for MVP

---

## FLOW 8: CUSTOMER LOGGING (High-Level Summary)

### Screen 8.1: Log Customer (Quick Entry)
- **Purpose:** Quick way to log new customer acquisition
- **Entry Points:** "I got a customer!" button on dashboard, within result logging for quests
- **Layout:** Modal with fields:
  - Customer count: Auto-increments from current count (e.g., 23 → 24)
  - Date acquired: Default today, can change
  - Source/Quest: Dropdown of active quests + "Other"
  - Notes (optional): Any details to remember
- **Actions:** Submit → Update customer count, award XP, trigger celebration if milestone
- **States:** Default form, submitting, success (celebration), error
- **Navigation:** Submit success → Celebration modal → Dashboard

### Screen 8.2: Customer Count Celebration
- **Purpose:** Celebrate customer acquisition, especially milestones
- **Triggers:** Any customer logged, special for 1st, 10th, 25th, 50th, 100th
- **Layout:** Full-screen or modal celebration animation, XP awarded, milestone message if applicable
- **Actions:** Continue → Dashboard with updated count
- **Special:** First customer = huge celebration, Growth Mode entry at 100

### Screen 8.3: Manual Count Adjustment (Settings)
- **Purpose:** Correct customer count (mistakes or churn)
- **Entry Points:** Settings → "Adjust customer count"
- **Layout:** Form showing current count, new count input, reason dropdown (Mistake | Churn | Other), notes field
- **Actions:** Submit → Update count, log correction event, update growth profile
- **States:** Confirmation required if large decrease, success message
- **Navigation:** Submit → Settings with confirmation message

---

## FLOW 9: SETTINGS (High-Level Summary)

### Screen 9.1: Settings Main
- **Purpose:** Manage account, profile, preferences
- **Layout:** Grouped sections:
  - **Account:** Email, password, delete account
  - **Profile:** Edit founder profile (company, ICP, stage, etc.)
  - **Notifications:** Email preferences (toggle each notification type)
  - **Subscription:** Current plan, payment method, billing history
  - **Customer Count:** Current count with "Adjust" link → Screen 8.3
- **Actions:** Edit any section opens sub-screen or inline edit
- **Navigation:** Each section navigates to detail screen or expands inline

### Screen 9.2: Edit Profile
- **Purpose:** Update founder profile fields
- **Layout:** Same fields as onboarding, pre-filled with current values
- **Actions:** Save changes → Detect significant changes (pivot) → Trigger drift handling from SPEC §5
- **States:** Editing, saving, saved confirmation
- **Navigation:** Save → Back to settings with success message

### Screen 9.3: Notification Preferences
- **Purpose:** Control which notifications user receives
- **Layout:** Toggle switches for each notification type:
  - Email: New quest, milestone, re-engagement, weekly recap, payment issues
  - In-app: (Always on, cannot disable)
- **Actions:** Toggle on/off, save preferences
- **States:** Default preferences, custom preferences, saving, saved
- **Navigation:** Auto-saves on toggle, back to settings

### Screen 9.4: Password Change
- **Purpose:** Update account password
- **Layout:** Current password, new password, confirm new password fields
- **Actions:** Submit → Validate and update
- **States:** Default form, validation errors, success
- **Navigation:** Success → Settings with confirmation

### Screen 9.5: Delete Account
- **Purpose:** Permanently delete account and data
- **Layout:** Warning message, "Are you sure?" confirmation, re-enter password
- **Actions:** Confirm → Delete account, cascade delete all data
- **States:** Confirmation required, deleting, deleted (logout)
- **Navigation:** Success → Logout → Landing page

---

## FLOW 10: SUBSCRIPTION & PAYMENT (High-Level Summary)

### Screen 10.1: Paywall (Trial Expired)
- **Purpose:** Block access until payment added
- **Entry Points:** Login when trial expired, attempting action when in restricted mode
- **Layout:** 
  - "Your trial has ended"
  - Progress summary (customers acquired, quests completed, level)
  - Pricing: $X/month, cancel anytime
  - "Add Payment Method" button
- **Actions:** Add payment → Stripe/payment processor integration → Reactivate account
- **States:** Trial expired, restricted mode, payment processing, success (redirect to dashboard)
- **Navigation:** Payment success → Dashboard fully restored

### Screen 10.2: Add Payment Method
- **Purpose:** Add credit card for subscription
- **Entry Points:** Paywall, settings subscription section, trial ending prompt
- **Layout:** Stripe Elements embedded form (card number, expiry, CVC, billing address)
- **Actions:** Submit → Process payment, create subscription
- **States:** Empty form, validation errors, processing, success, error (declined card)
- **Navigation:** Success → Return to previous screen or dashboard

### Screen 10.3: Subscription Management (Settings)
- **Purpose:** View and manage subscription
- **Layout:**
  - Current plan: "Get100 Pro - $X/month"
  - Payment method: •••• 4242 (last 4 digits) with "Update" button
  - Next billing date
  - Billing history (list of past invoices)
  - "Cancel subscription" link
- **Actions:** Update payment, download invoice, cancel subscription
- **Navigation:** Each action opens relevant sub-screen

### Screen 10.4: Cancel Subscription
- **Purpose:** Cancel subscription (with retention attempt)
- **Layout:**
  - "Are you sure you want to cancel?"
  - Your progress (customers, level, etc.)
  - Retention offer (optional): "Get 25% off for 3 months"
  - Reason dropdown: Why are you canceling?
  - Confirm cancel button
- **Actions:** Confirm → Cancel subscription (remains active until period end), decline offer → process cancellation
- **States:** Confirmation, processing, cancelled
- **Navigation:** Cancelled → Settings with confirmation, subscription remains active until period end

### Screen 10.5: Payment Failed / Dunning
- **Purpose:** Handle failed payment gracefully
- **Entry Points:** Auto-displayed as banner on dashboard, email link
- **Layout:** Banner/modal with:
  - "Payment issue - Update your payment method"
  - Days remaining in grace period: "6 days until account is paused"
  - "Update Payment" button
- **Actions:** Update payment → Screen 10.2 → Retry charge
- **States:** Grace period active, payment processing, resolved, grace period expired (restricted mode)
- **Navigation:** Resolved → Banner disappears, expired → Screen 10.1 (Paywall)

---

## FLOW 11: ADMIN DASHBOARD (High-Level Summary)

### Screen 11.1: Admin Login
- **Purpose:** Separate admin authentication
- **Entry Points:** /admin route
- **Layout:** Simple login form (admin-only credentials)
- **Actions:** Login → Verify admin role → Dashboard
- **States:** Default, logging in, error (not admin), success
- **Navigation:** Success → Screen 11.2 (Admin Dashboard)

### Screen 11.2: Admin Dashboard
- **Purpose:** Overview of platform metrics
- **Layout:**
  - Total users count
  - Active users (last 7 days)
  - Trial conversions rate
  - Churn rate
  - Customer acquisition stats (aggregate)
  - Recent signups list
  - Quick actions: View users, support tickets
- **Actions:** Click sections to drill down
- **Navigation:** To various admin screens

### Screen 11.3: User List
- **Purpose:** View all founders
- **Layout:** Table with columns:
  - Name, Email, Company
  - Subscription status (Trial | Active | Expired | Cancelled)
  - Customer count, Level, Last active
  - Actions: View detail | Impersonate | Override subscription
- **Actions:** Search, filter by status, sort, click user → Screen 11.4
- **States:** Loading, populated, search results, empty
- **Navigation:** Click user → Screen 11.4 (User Detail)

### Screen 11.4: User Detail (Admin View)
- **Purpose:** Deep view into specific founder's account
- **Layout:**
  - Founder profile (all fields)
  - Growth profile (full view)
  - Quest history
  - Customer events log
  - Subscription details
  - Admin actions: Manual override, reset account, delete user
- **Actions:** View read-only data, perform admin actions
- **States:** Loading, populated
- **Navigation:** Back to User List, Impersonate → Login as user → Screen 3.1 (Dashboard)

### Screen 11.5: Admin Impersonation Mode
- **Purpose:** View product as specific user for debugging
- **Entry Points:** User Detail "Impersonate" action
- **Layout:** Normal product UI (dashboard, quests, etc.) with banner at top: "Viewing as [Name] - Exit impersonation"
- **Actions:** Use product normally (read-only, no destructive actions), exit impersonation
- **States:** Impersonating (banner visible), exited
- **Navigation:** Exit → Back to Screen 11.4 (User Detail)

---

## FLOW 12: NOTIFICATIONS (High-Level Summary)

### In-App Notifications
- **Location:** Notification bell icon in header (badge count), dropdown panel when clicked
- **Types:**
  - New quest available
  - Quest deadline approaching
  - Milestone reached (level up, customer count)
  - AI analysis complete
  - Achievement unlocked
  - Payment issue
- **Layout:** List of notifications, newest first, unread badge, click to view detail or take action
- **Actions:** Click notification → Navigate to relevant screen, mark as read, clear all
- **States:** No notifications (empty), unread notifications (badge count), all read
- **Persistence:** Notifications stored, viewable anytime

### Email Notifications
- **Triggers:** (per SPEC §11)
  - New quest available
  - Quest deadline approaching (suggested_window)
  - Re-engagement (5, 14, 30 days inactive)
  - Milestone celebrations
  - Weekly progress recap
  - Payment issues (dunning)
  - Trial ending soon
- **Content:** Personalized based on user data, deep links back to app
- **Preferences:** Controlled via Settings → Notification Preferences (Screen 9.3)
- **States:** Queued, sent, failed, bounced (logged for admin review)

### Notification Deep Links
- **Purpose:** Email/in-app notification clicks navigate directly to relevant screen
- **Examples:**
  - "New quest" → Screen 4.1 (Quest Detail) for specific quest
  - "Milestone" → Dashboard with celebration modal
  - "Payment issue" → Screen 10.5 (Dunning) or Screen 10.2 (Add Payment)
  - "Quest deadline" → Screen 4.1 (Quest Detail)
- **Handling:** Authenticated deep links with token, redirect to login if not authenticated, then to target screen

---

## FLOW CROSS-REFERENCES

### Common Navigation Patterns

**Global Header (on all logged-in screens):**
- Logo → Dashboard (Screen 3.1)
- Quest Journal link → Screen 5.1
- Settings link → Screen 9.1
- Notifications bell → Notification panel
- Chat bubble → Screen 6.1 (always accessible)
- User menu → Profile, Logout

**Quest-Related Navigation:**
- Any quest reference → Screen 4.1 (Quest Detail)
- "Mark as Done" → Screen 4.6 (Result Logging)
- Result submission → Screen 4.7 (Result Summary)
- Quest completion → Dashboard refresh with updated quest log

**Customer Count Related:**
- "I got a customer" button → Screen 8.1 (Log Customer)
- Customer logged → Screen 8.2 (Celebration if applicable)
- Milestone reached → Celebration modal/screen → Dashboard

**Payment Related:**
- Trial ending banner → Screen 10.2 (Add Payment)
- Payment failed banner → Screen 10.5 (Dunning) → Screen 10.2 (Update Payment)
- Subscription management → Screen 10.3 (from Settings)

**Admin Related:**
- All admin screens accessible only to admin role
- Impersonation mode overlays normal user screens

---

## STATE TRANSITION MATRIX

### Quest Lifecycle States
```
suggested → active (user starts quest)
active → awaiting_report (user marks done, hasn't logged results)
awaiting_report → completed (user logs results)
active → skipped (user skips quest)
active → expired (suggested_window passes, no action)
expired → skipped (auto-transition)
```

### User Account States
```
new → email_not_verified (after signup)
email_not_verified → onboarding (after email verification)
onboarding → trial_active (after onboarding complete)
trial_active → subscription_active (after payment added)
trial_active → trial_expired (after 14 days, no payment)
trial_expired → restricted_mode (cannot use product, read-only)
subscription_active → payment_failed_grace (payment declined, 7-day grace)
payment_failed_grace → restricted_mode (after grace period)
restricted_mode → subscription_active (after payment updated)
subscription_active → cancelled (user cancels, active until period end)
cancelled → expired (after subscription period ends)
```

### Customer Count States
```
0 customers → 1 customer (first customer milestone)
1-9 customers → 10 customers (milestone)
10-24 customers → 25 customers (milestone)
25-49 customers → 50 customers (milestone)
50-99 customers → 100 customers (MAJOR milestone, Growth Mode)
100+ customers → Growth Mode (continued with new milestones: 250, 500, etc.)
```

---

## LOADING & ERROR PATTERNS

### Standard Loading States (Apply to All Screens)
- **Initial Load:** Skeleton loaders matching content structure
- **Action Loading:** Button shows spinner, disables, shows "Processing..." text
- **Background Loading:** Non-blocking spinner in corner, content remains accessible
- **Async Generation (Quests, Analysis):** Progress indicator with estimated time or friendly message

### Standard Error States (Apply to All Screens)
- **Network Error:** "Connection lost. Check your internet and try again." with Retry button
- **API Error:** "Something went wrong. Please try again." with Retry button
- **Validation Error:** Inline field error messages, form-level error summary
- **Permission Error:** "You don't have access to this. Contact support if this is a mistake."
- **Not Found:** "We couldn't find that [quest/page/resource]. It may have been deleted."

### Error Recovery Actions
- **Retry:** Available for transient errors (network, API)
- **Go Back:** Navigate to previous screen
- **Go Home:** Navigate to Dashboard
- **Contact Support:** Link to support (email or chat)
- **Logout:** If account state is corrupted

---

## RESPONSIVE BEHAVIOR (Mobile Considerations)

### Layout Adaptations
- **Desktop (>1024px):** Full layout as described, sidebar if applicable
- **Tablet (768-1024px):** Condensed layout, sidebar becomes drawer
- **Mobile (<768px):** Stacked layout, all panels full-width, bottom navigation

### Mobile-Specific Patterns
- **Quest Cards:** Stack vertically, full-width
- **Chat Interface:** Full-screen on mobile (not floating bubble)
- **Forms:** One field at a time on small screens (onboarding already does this)
- **Navigation:** Bottom tab bar (Dashboard | Journal | Settings) + hamburger menu
- **Modals:** Full-screen on mobile, modal on desktop
- **Tables (Admin):** Horizontal scroll or card view on mobile

### Touch Interactions
- **Swipe gestures:** Swipe to dismiss modals, swipe between tabs (optional)
- **Pull to refresh:** On dashboard and lists
- **Long press:** Alternative to hover actions (e.g., long press quest for quick actions)

---

## ACCESSIBILITY REQUIREMENTS

### Keyboard Navigation
- All interactive elements focusable via Tab
- Modal trapping (Tab cycles within modal)
- Escape closes modals/dialogs
- Arrow keys navigate lists where appropriate

### Screen Reader Support
- Semantic HTML (headings, landmarks, lists)
- ARIA labels for icons and buttons without text
- ARIA live regions for dynamic updates (notifications, quest updates)
- Alt text for images and icons

### Visual Accessibility
- Color contrast meets WCAG AA (4.5:1 for text)
- Focus indicators visible on all interactive elements
- Text resizable up to 200% without breaking layout
- No information conveyed by color alone

### Cognitive Accessibility
- Clear, simple language
- Consistent navigation and patterns
- Confirmation dialogs for destructive actions
- Progress indicators for multi-step processes

---

## PERFORMANCE TARGETS

### Page Load Times
- Dashboard: <1s initial paint, <2s fully interactive
- Quest Detail: <500ms (data should be cached)
- Result Logging: <300ms (simple form)
- AI Chat: <1s for response start (streaming preferred)

### API Response Times
- Quest recommendation: <3s (can be async)
- Result analysis: <5s (can be async with progress indicator)
- Customer logging: <500ms (critical path)
- Profile updates: <1s

### Asset Optimization
- Images: WebP with fallbacks, lazy loading
- Fonts: Preload critical fonts, subset where possible
- JavaScript: Code splitting by route, lazy load non-critical
- CSS: Critical CSS inlined, progressive enhancement

---

## PHASE 6 COMPLETION SUMMARY

### Flows Documented (Detailed)
1. ✅ Authentication (6 screens)
2. ✅ Onboarding (10 screens)
3. ✅ Main Dashboard (3 variations)
4. ✅ Quest Interactions (7 screens)

### Flows Documented (High-Level)
5. ✅ Quest Journal (2 screens)
6. ✅ AI Coach Chat (1 primary + interaction patterns)
7. ✅ Growth Insights (2 screens)
8. ✅ Customer Logging (3 screens)
9. ✅ Settings (5 screens)
10. ✅ Subscription & Payment (5 screens)
11. ✅ Admin Dashboard (5 screens)
12. ✅ Notifications (in-app + email patterns)

### Additional Documentation
- ✅ Flow cross-references
- ✅ State transition matrix
- ✅ Loading & error patterns
- ✅ Responsive behavior
- ✅ Accessibility requirements
- ✅ Performance targets

---

## READY FOR PHASE 7: INFORMATION ARCHITECTURE

With user flows complete, we now have:
- Every screen defined
- All user actions mapped
- State variations documented
- Navigation paths clear
- Data requirements identified

**Next phase will organize this into:**
- Navigation structure
- Sitemap
- Page hierarchy
- URL structure
- Content organization

---

**Proceed to Phase 7: Information Architecture?**
