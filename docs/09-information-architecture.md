# Phase 7: Information Architecture

**Document Version:** 1.0  
**Date:** September 20, 2026  
**Status:** Complete

---

## PURPOSE

This document defines the information architecture for Get100 Customers, organizing all screens and features into a logical, navigable structure. It includes:
- Navigation structure and hierarchy
- Complete sitemap
- URL structure
- Content organization
- User mental models

---

## NAVIGATION STRUCTURE

### Primary Navigation (Logged-In Users)

```
┌─────────────────────────────────────────────────────┐
│  Logo    Dashboard    Journal    Settings    👤 📬 💬 │
└─────────────────────────────────────────────────────┘
```

**Top Navigation Bar (Always Visible):**
1. **Logo** → Dashboard (home)
2. **Dashboard** → Main dashboard (Screen 3.1)
3. **Quest Journal** → Quest history (Screen 5.1)
4. **Settings** → Account settings (Screen 9.1)
5. **Notification Bell** (📬) → Notification dropdown
6. **User Menu** (👤) → Profile dropdown (Profile, Logout)
7. **Chat Bubble** (💬) → AI Coach chat (Screen 6.1) - Floating, persistent

**Mobile Navigation:**
- Bottom tab bar: Dashboard | Journal | Settings
- Hamburger menu: Additional options
- Chat: Full-screen overlay

---

## SITEMAP

### Public (Unauthenticated)

```
/ (Landing Page)
│
├─ /signup
│  └─ /verify-email
│
├─ /login
│
└─ /reset-password
   └─ /reset-password/[token]
```

### Application (Authenticated)

```
/app
│
├─ /app/onboarding
│  ├─ /app/onboarding/welcome
│  ├─ /app/onboarding/company
│  ├─ /app/onboarding/industry
│  ├─ /app/onboarding/product
│  ├─ /app/onboarding/customer
│  ├─ /app/onboarding/stage
│  ├─ /app/onboarding/count
│  ├─ /app/onboarding/channels
│  ├─ /app/onboarding/upload
│  └─ /app/onboarding/preparing
│
├─ /app/dashboard (Main Hub)
│
├─ /app/quests
│  ├─ /app/quests/[questId]
│  ├─ /app/quests/[questId]/log-results
│  ├─ /app/quests/[questId]/alternatives
│  └─ /app/quests/[questId]/tools/[toolId]
│
├─ /app/journal
│  └─ /app/journal/[questId]
│
├─ /app/customers
│  ├─ /app/customers/log
│  └─ /app/customers/adjust
│
├─ /app/settings
│  ├─ /app/settings/profile
│  ├─ /app/settings/account
│  ├─ /app/settings/notifications
│  ├─ /app/settings/subscription
│  └─ /app/settings/delete
│
├─ /app/subscription
│  ├─ /app/subscription/add-payment
│  ├─ /app/subscription/update-payment
│  └─ /app/subscription/cancel
│
└─ /app/restricted (Trial expired / payment failed state)
```

### Admin

```
/admin
│
├─ /admin/login
│
├─ /admin/dashboard
│
├─ /admin/users
│  ├─ /admin/users/[userId]
│  └─ /admin/users/[userId]/impersonate
│
└─ /admin/analytics
```

---

## URL STRUCTURE & ROUTING

### Routing Patterns

**Authentication Routes** (Public)
```
GET  /                     → Landing page
GET  /signup               → Signup form
POST /signup               → Create account
GET  /login                → Login form
POST /login                → Authenticate
GET  /verify-email         → Email verification pending
GET  /verify-email/[token] → Verify email with token
GET  /reset-password       → Request reset form
POST /reset-password       → Send reset email
GET  /reset-password/[token] → Reset form with token
POST /reset-password/[token] → Update password
GET  /logout               → Clear session, redirect to login
```

**Onboarding Routes** (Authenticated, not yet onboarded)
```
GET  /app/onboarding/* → Onboarding steps (sequential)
POST /app/onboarding/* → Save step data, advance
```

**Application Routes** (Authenticated, onboarded)
```
GET  /app/dashboard        → Main dashboard
GET  /app/quests/[id]      → Quest detail
POST /app/quests/[id]/start → Mark quest as active
POST /app/quests/[id]/skip → Skip quest with reason
POST /app/quests/[id]/log-results → Submit quest results
GET  /app/quests/[id]/alternatives → Alternative quests
GET  /app/journal          → Quest history
POST /app/customers/log    → Log new customer
POST /app/customers/adjust → Adjust customer count
GET  /app/settings/*       → Settings screens
POST /app/settings/*       → Update settings
```

**Admin Routes** (Admin role required)
```
GET  /admin/*              → Admin screens
POST /admin/*              → Admin actions
```

### Deep Link Patterns

**Notification Deep Links:**
```
/app/quests/[id]?source=email&notification=[notifId]
/app/dashboard?celebrate=milestone-10
/app/subscription/add-payment?source=trial-ending
```

**Shareable Links** (Future feature)
```
/app/achievements/[id] (if we add sharable achievements)
```

---

## PAGE HIERARCHY

### Level 1: Landing & Auth
```
Landing Page (Public)
├─ Signup
├─ Login
└─ Password Reset
```

### Level 2: Onboarding (First-Time Setup)
```
Onboarding Flow (Sequential, cannot skip)
├─ Welcome
├─ Company Info (4 steps)
├─ Business Stage (2 steps)
├─ Channels Tried
├─ Optional Upload
└─ Preparing Quests
```

### Level 3: Main Application (Primary Experience)
```
Dashboard (Hub)
├─ Active Quests Section
│  └─ Quest Detail (Level 4)
│     ├─ Tools/Templates
│     ├─ Log Results
│     └─ Alternatives
│
├─ Progress Section (displayed, not navigable)
│
├─ Growth Insights Section (displayed, not navigable)
│
└─ Actions
   ├─ Log Customer
   └─ Get Next Quest
```

### Level 4: Secondary Features (Supporting Experience)
```
Quest Journal (History)
└─ Past Quest Detail (read-only)

Settings (Account Management)
├─ Profile
├─ Account
├─ Notifications
├─ Subscription
└─ Delete Account

Customer Management
├─ Log Customer
└─ Adjust Count

Chat (Persistent, not in hierarchy)
└─ Always accessible overlay
```

### Level 5: Subscription & Payment (As Needed)
```
Subscription Management
├─ Add Payment
├─ Update Payment
├─ Billing History
└─ Cancel Subscription

Restricted Mode (Blocking State)
└─ Paywall → Add Payment
```

### Level 6: Admin (Separate Hierarchy)
```
Admin Dashboard
├─ User Management
│  └─ User Detail
│     └─ Impersonate
│
└─ Platform Analytics
```

---

## NAVIGATION PATTERNS BY USER ROLE

### New User (First Session)
```
Landing → Signup → Email Verification → Onboarding (8 steps) → Dashboard (first time overlay)
```

### Returning User (Standard Flow)
```
Login → Dashboard → [Quest Detail | Journal | Settings | Chat] → Dashboard
```

### User with Active Quest
```
Dashboard → Quest Detail → [Work offline] → Return → Log Results → Result Summary → Dashboard (updated)
```

### User with Trial Ending
```
Login → Dashboard (with trial banner) → Add Payment → Dashboard (banner removed)
```

### User with Expired Trial
```
Login → Paywall → Add Payment → Dashboard (full access restored)
```

### Admin User
```
/admin/login → Admin Dashboard → [Users | Analytics] → User Detail → [Impersonate → User Experience | Admin Actions]
```

---

## CONTENT ORGANIZATION

### Dashboard (Information Hierarchy)

**Priority 1 (Top):** Progress & Status
- Customer count progress bar (largest, most prominent)
- Level & XP
- Streak indicator

**Priority 2 (Middle):** Active Quests
- Up to 3 quest cards
- Clear CTAs (View / Mark as Done)
- Empty state if no active quests

**Priority 3 (Bottom/Sidebar):** Insights & Context
- Growth insights panel
- Next milestone preview
- Recent wins

**Always Accessible:**
- Chat bubble (floating)
- "I got a customer" button (prominent)
- Navigation header

### Quest Detail (Information Hierarchy)

**Priority 1:** Quest Overview
- Title & description
- XP reward
- Status badge

**Priority 2:** Why This Quest
- Personalized context
- Relevance to founder's situation

**Priority 3:** How to Complete
- Step-by-step instructions
- Sub-tasks (if applicable)
- Success criteria

**Priority 4:** Tools & Support
- Templates
- Examples
- Chat for questions

**Priority 5:** Actions
- Primary: Start / Mark as Done
- Secondary: Skip / Alternatives

### Settings (Information Organization)

**Grouped by Function:**
1. **Account** (authentication, security)
2. **Profile** (business information)
3. **Notifications** (communication preferences)
4. **Subscription** (billing, plan)
5. **Danger Zone** (delete account)

---

## USER MENTAL MODELS

### How Users Think About Get100

**Primary Mental Model:** "Growth Dashboard"
- Like a game dashboard showing my progress
- Quests are my to-do list, but personalized
- Progress bar shows me getting closer to goal
- AI coach helps when I'm stuck

**Secondary Mental Model:** "Personal Coach"
- Available whenever I need help (chat)
- Knows my business and situation
- Gives me specific, actionable advice
- Celebrates my wins

**Not a Chat App:**
- The main interaction is NOT typing to an AI
- It's viewing my dashboard, picking quests, completing them
- Chat is supplementary, not primary

### Navigation Mental Model

**Hub-and-Spoke Pattern:**
- Dashboard is the hub (always return here)
- Quests, journal, settings are spokes (navigate out and back)
- Chat is omnipresent (available anywhere)

**Linear Flow for Quests:**
- View quest → Do work (offline) → Log results → Get next quest → Repeat

**Settings as Utility:**
- Not part of main flow
- Accessed when needed (change preferences, manage account)
- Separate mental space from "doing growth work"

---

## MOBILE INFORMATION ARCHITECTURE

### Bottom Navigation (Mobile Primary Nav)
```
┌───────────────────────────────────────┐
│                                       │
│         Screen Content                │
│                                       │
│                                       │
└───────────────────────────────────────┘
┌─────────┬──────────┬──────────┬───────┐
│ 🏠 Home │ 📋 Tasks │ 💬 Chat  │ ⚙️ More│
└─────────┴──────────┴──────────┴───────┘
```

**Bottom Tabs:**
1. Home → Dashboard
2. Tasks → Quest Journal
3. Chat → AI Coach
4. More → Settings + Additional options

**Rationale:** Most important actions thumb-reachable at bottom

### Mobile Hierarchy Differences
- **Drawer Menu:** Accessed from "More" tab, contains less-used features
- **Full-Screen Modals:** Quest detail, result logging, settings screens
- **Swipe Gestures:** Swipe between tabs (optional), swipe to dismiss modals
- **Collapsible Sections:** Dashboard sections collapse on mobile to save space

---

## ACCESSIBILITY NAVIGATION

### Keyboard Navigation
```
Tab → Focus next interactive element
Shift+Tab → Focus previous
Enter/Space → Activate button/link
Escape → Close modal/dialog
Arrow keys → Navigate lists (quest cards, journal)
```

### Screen Reader Landmarks
```
<header role="banner">     → Top navigation
<nav role="navigation">    → Main nav menu
<main role="main">         → Dashboard content
<aside role="complementary"> → Growth insights panel
<footer role="contentinfo"> → Footer
```

### Skip Links
```
Skip to main content → Jump past nav to dashboard
Skip to active quests → Jump to quest section
Skip to chat → Open chat interface
```

---

## BREADCRUMB PATTERNS

**Not Used in Main App** (flat hierarchy, hub-and-spoke model)

**Used in Admin:**
```
Admin Dashboard > Users > [User Name] > Impersonate
```

**Used in Deep Flows:**
```
Settings > Profile > Edit Company Info
```

---

## SEARCH & FILTERING

### Quest Journal Search
- **Search bar:** Filter by quest title or description
- **Filters:** All | Completed | Skipped | Expired
- **Sort:** Date (newest first, oldest first), XP earned

### Settings Search (Future)
- Quick search within settings to find specific option

### Admin User Search
- Search by name, email, company
- Filter by subscription status, activity level
- Sort by date joined, last active, customer count

---

## ERROR PAGE HIERARCHY

### 404 Not Found
```
/app/404
- "We couldn't find that page"
- Link to Dashboard
- Link to Quest Journal
- Chat bubble available for help
```

### 403 Forbidden
```
/app/403
- "You don't have permission to view this"
- Link to Dashboard
- Link to Logout
```

### 500 Server Error
```
/app/error
- "Something went wrong on our end"
- "We're working on it. Try again in a few minutes."
- Retry button
- Link to Dashboard
```

### Restricted Mode (Trial Expired / Payment Failed)
```
/app/restricted
- Banner on every page: "Your account is restricted"
- All screens read-only
- Prominent "Update Payment" button
- Can view history, cannot take new actions
```

---

## INFORMATION ARCHITECTURE PRINCIPLES

### 1. Progressive Disclosure
- Show most important information first (progress, active quests)
- Details available on-demand (quest detail, tools, analytics)
- Advanced features available but not prominent (settings, admin)

### 2. Task-Oriented Organization
- Structure mirrors user goals: "Complete quests to get customers"
- Not feature-oriented ("Here are all our features")
- Primary path is clear and unobstructed

### 3. Minimal Navigation Depth
- Most screens accessible in 1-2 clicks from dashboard
- No deep nested navigation
- Hub-and-spoke model keeps users oriented

### 4. Context-Aware Navigation
- Back buttons return to previous screen (not always dashboard)
- Deep links maintain context (e.g., from email notification)
- Breadcrumbs when navigation is ambiguous

### 5. Escape Hatches
- Chat always available for help
- Dashboard link always in header (home)
- Clear way to skip/dismiss when stuck

---

## URL NAMING CONVENTIONS

### Consistency Rules
- Use kebab-case: `/app/quest-journal` not `/app/QuestJournal`
- Plural for collections: `/app/quests` not `/app/quest`
- Singular for specific item: `/app/quests/[id]` not `/app/quests/[ids]`
- Actions as verbs: `/app/customers/log` not `/app/customers/logging`
- Nested resources when logical: `/app/quests/[id]/tools` not `/app/quest-tools`

### RESTful Patterns (API mirrors URLs)
```
GET    /app/quests        → List quests
GET    /app/quests/[id]   → View quest detail
POST   /app/quests/[id]/start → Start quest (action)
PUT    /app/quests/[id]   → Update quest (admin)
DELETE /app/quests/[id]   → Delete quest (admin)
```

---

## SITEMAP SUMMARY

### Total Screens: 54
- **Public:** 4 screens (landing, signup, login, reset)
- **Onboarding:** 10 screens (sequential flow)
- **Main App:** 28 screens (dashboard, quests, journal, customers, settings, subscription)
- **Admin:** 5 screens (dashboard, users, detail, impersonate, analytics)
- **Error States:** 3 screens (404, 403, 500)
- **Chat:** 1 persistent overlay (not counted as separate screen)
- **Notifications:** 1 dropdown panel (not counted as separate screen)

### Primary User Paths (Most Common)
1. **Daily Active User:** Dashboard → Quest Detail → [Offline Work] → Log Results → Dashboard
2. **New User:** Signup → Onboarding → Dashboard → First Quest
3. **Re-engagement:** Email Link → Dashboard → Continue Quest
4. **Support:** Dashboard → Chat → Get Help → Continue Quest
5. **Milestone:** Dashboard → Log Customer → Celebration → Dashboard

---

## PHASE 7 COMPLETE

### Deliverables ✓
- ✅ Navigation structure defined
- ✅ Complete sitemap (54 screens organized)
- ✅ URL structure and routing patterns
- ✅ Page hierarchy (6 levels)
- ✅ Content organization principles
- ✅ User mental models documented
- ✅ Mobile IA adaptations
- ✅ Accessibility navigation patterns
- ✅ Error page hierarchy
- ✅ IA principles established

### Ready for Phase 8: UX Specification

Next phase will define detailed UX behavior for major components and interactions, including:
- Component specifications
- Interaction patterns
- Form validation rules
- Feedback mechanisms
- Modal behaviors
- Notification UX
- Loading patterns
- Empty states
- Error handling UX
- Responsive behavior details

---

**Proceed to Phase 8: UX Specification?**
