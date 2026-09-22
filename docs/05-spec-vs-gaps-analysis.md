# SPEC.md vs Gap Questions Analysis

**Document Version:** 1.0  
**Date:** September 20, 2026  
**Purpose:** Compare existing SPEC.md against identified gap questions to determine what's decided vs what needs clarification

---

## SUMMARY

**Status:** SPEC.md answers approximately **60-65%** of the gap questions at a high level.

**Strengths of existing SPEC:**
- Clear product vision and core loop
- Well-defined MVP scope vs deferred features
- Technical stack chosen
- Data model drafted
- Business model direction established
- Gamification mechanics scoped appropriately

**What still needs definition:**
- Detailed quest generation system architecture
- Result analysis and learning mechanics
- AI adaptation logic specifics
- User experience flows and interactions
- Notification/communication rules
- Several operational and edge case decisions

---

## DETAILED COMPARISON

### ✅ FULLY ANSWERED IN SPEC

#### 1. Product Vision & Scope
- **Gap Q1.1 (Onboarding data):** ✅ ANSWERED
  - SPEC Section 5 defines onboarding fields clearly
  - Structured form + conversational wizard + optional doc upload
  - Founder profile structure defined

- **Gap Q2.1 (Quest generation approach):** ✅ PARTIALLY ANSWERED
  - SPEC Section 8 describes AI-generated quests
  - But doesn't specify: template library vs pure AI vs hybrid
  - **Needs clarification:** Is there a quest template library or purely AI-generated?

- **Gap Q5.1-5.2 (Stages/chapters):** ✅ ANSWERED (Deferred)
  - SPEC Section 6 explicitly defers visual journey/map to post-MVP
  - MVP uses simple linear progression
  - No chapters/stages in MVP

- **Gap Q6.1-6.3 (XP, Levels, Progression):** ✅ ANSWERED
  - SPEC Section 6 defines XP & Levels system
  - Levels are cosmetic/motivational (no feature gating)
  - Streaks included
  - Badges/achievements explicitly deferred

- **Gap Q7.1-7.2 (Unlocks):** ✅ ANSWERED
  - SPEC Section 6: No gating of features behind levels in MVP
  - Everything available from start (Option A from gaps)

- **Gap Q10.1-10.2 (Customer tracking):** ✅ ANSWERED
  - SPEC Section 7: Manual self-report
  - Founder marks quest/action as resulting in customer
  - Increments count and awards XP
  - No verification required in MVP

- **Gap Q12.1-12.2 (Subscription):** ✅ PARTIALLY ANSWERED
  - SPEC Section 3: Subscription (SaaS) model
  - Single tier for MVP is fine
  - **Open question in SPEC:** Trial strategy not defined
  - **Open question in SPEC:** Pricing amount not specified

- **Gap Q14.1 (Authentication):** ✅ ANSWERED
  - SPEC Section 9: Supabase Auth
  - Stack decision made

- **Gap Q16.1 (Mobile):** ✅ IMPLIED
  - SPEC Section 9: Next.js frontend
  - Likely responsive web (not mentioned explicitly)
  - **Needs confirmation:** Mobile responsiveness vs desktop-only

- **Gap Q17.1 (Internationalization):** ✅ IMPLIED
  - Not explicitly mentioned, but since target is "startup founders" globally
  - English-first is reasonable assumption
  - **Needs confirmation:** i18n architecture

#### 2. Technical Decisions
- **Stack:** ✅ FULLY DEFINED (SPEC Section 9)
  - Frontend: Next.js
  - Backend: Supabase (Postgres, Auth, Storage)
  - AI: LLM calls (server-side)
  - Hosting: Vercel + Supabase
  
- **Data Model:** ✅ DRAFTED (SPEC Section 10)
  - Founders table defined
  - Quests table defined
  - Customer_events table defined
  - Subscriptions table defined
  - **Needs expansion:** Growth profile / user state (from Gap Q4.2)

#### 3. Scope Management
- **MVP vs Post-MVP:** ✅ CLEARLY DEFINED (SPEC Section 14)
  - In-scope features listed
  - Deferred features listed
  - No scope creep confusion

---

### ⚠️ PARTIALLY ANSWERED IN SPEC (Needs Clarification)

#### Gap Q1.2: Context Updates Over Time
- **SPEC says:** Onboarding collects founder profile
- **SPEC doesn't say:** How profile updates over time as business changes
- **Needs decision:** Can founder edit profile? Does AI detect context drift?

#### Gap Q2.1: Quest Generation Architecture
- **SPEC says:** "AI-generated personalized quests"
- **SPEC doesn't say:** 
  - Is there a quest template library?
  - Or fully AI-generated each time?
  - Or hybrid?
- **Recommendation:** Hybrid (templates + AI customization) for quality + flexibility
- **Needs decision:** Confirm approach

#### Gap Q2.2: Quest Structure Definition
- **SPEC says:** Quests have title, description, XP value, status, suggested channel/category
- **SPEC doesn't say:**
  - Detailed quest data model (instructions, tools provided, result questions, success criteria)
  - Whether quests have sub-tasks
  - Whether quests have deadlines
- **Needs decision:** Full quest structure

#### Gap Q2.3: Quest Recommendation Logic
- **SPEC says:** AI adapts based on what's working/not working
- **SPEC doesn't say:** 
  - Detailed logic for how next quest is chosen
  - Whether user sees alternatives or just one recommendation
  - Whether user can request different quest
- **Needs decision:** Recommendation UX

#### Gap Q2.4: Quest Lifecycle States
- **SPEC says:** status (active/complete/skipped)
- **SPEC doesn't say:**
  - Full state model (waiting for results, blocked, paused, etc.)
  - Can user have multiple active quests?
  - What happens to completed quests?
- **Needs decision:** Full lifecycle

#### Gap Q3.1-3.2: AI Coach Chat Interface
- **SPEC says:** "should NOT be a chat window as primary surface"
- **SPEC doesn't say:**
  - Is there ANY chat interface for questions?
  - If so, where does it live? (sidebar, bubble, modal)
  - What context does chat have?
- **From earlier discovery:** You confirmed hybrid model (game UI + chat available)
- **Needs decision:** Chat interface details

#### Gap Q4.1: Result Analysis System
- **SPEC says:** Founder "self-reports completion/results"
- **SPEC doesn't say:**
  - How are results collected? (structured questions? free text?)
  - How does AI analyze results?
  - What data is captured beyond "customer acquired"?
- **From earlier discovery:** You want structured questions based on quest type
- **Needs decision:** Result logging UX and data model

#### Gap Q4.2: Growth Profile / User State
- **SPEC has:** Basic founder profile (Section 10)
- **SPEC doesn't have:** 
  - Dynamic "what we've learned" state
  - What's working vs not working tracking
  - Bottleneck identification
  - Strategy evolution history
- **From earlier discovery:** This is core system capability
- **Needs decision:** Growth profile data structure

#### Gap Q8.1-8.2: Templates & Tools
- **SPEC says:** Quests are AI-generated
- **SPEC doesn't say:**
  - Does system provide email templates, frameworks, scripts?
  - How personalized are they?
  - Where do they live in the UX?
- **From earlier discovery:** You want Tier 2 automation (templates & tools)
- **Needs decision:** Template system architecture

#### Gap Q9.1-9.3: User Journey Timing & Pacing
- **SPEC says:** "proactively surfaces next quest"
- **SPEC doesn't say:**
  - When is next quest available?
  - Can quests have "wait periods"?
  - How often should founder engage?
  - What happens if founder doesn't return?
- **From earlier discovery:** Quest-dependent timing, not fixed schedule
- **Needs decision:** Pacing logic and re-engagement rules

#### Gap Q11.1-11.2: Notifications & Communication
- **SPEC doesn't mention:** Notification system at all
- **From earlier discovery:** You want in-app + email notifications
- **Needs decision:**
  - When do we send notifications?
  - What triggers emails?
  - Can user customize preferences?

#### Gap Q12.3: Payment Failure Handling
- **SPEC says:** Subscription model with single tier for MVP
- **SPEC doesn't say:** What happens when payment fails
- **Needs decision:** Grace period policy

#### Gap Q13.1-13.2: Admin Tools
- **SPEC doesn't mention:** Admin dashboard or tools
- **Needs decision:** Minimum admin capabilities for launch

#### Gap Q14.2: Data Privacy
- **SPEC doesn't mention:** GDPR, CCPA, privacy compliance
- **Needs decision:** Privacy policy, data export/deletion

#### Gap Q15.1-15.2: Performance & Scale
- **SPEC mentions:** "Reasonable AI response latency"
- **SPEC doesn't say:**
  - Expected user scale
  - AI cost budget
  - Performance targets
- **Needs decision:** Scale expectations and cost management

#### Gap Q18.1-18.2: Analytics
- **SPEC Section 12:** Success metrics defined (high-level)
- **SPEC doesn't say:**
  - User-facing analytics (what does founder see in dashboard?)
  - Internal analytics tools
- **Needs decision:** Analytics architecture

#### Gap Q19.1-19.2: AI Quality Assurance
- **SPEC doesn't mention:** How to ensure AI quality
- **Needs decision:** Testing strategy, failure handling

---

### ❌ NOT ANSWERED IN SPEC (Needs Decisions)

#### Gap Q20.1: User Reaches 100 Customers
- **Question:** What happens when founder hits 100?
- **Decision needed:** Journey ends? Continues? Celebration experience?

#### Gap Q20.2: User Loses Customers (Churn)
- **Question:** Can customer count go down?
- **Decision needed:** How to handle churn

#### Gap Q20.3: User Has 100+ Customers at Signup
- **Question:** Do we allow signup if already past goal?
- **Decision needed:** Turn away or allow with different journey?

#### Gap Q20.4: User Pivots Business
- **Question:** What if founder completely changes their business?
- **Decision needed:** Reset journey? Continue? New onboarding?

#### Gap Q20.5: User Disagrees with Recommendations
- **Question:** What if founder refuses to do recommended quests?
- **Decision needed:** Skip mechanism, alternative quests, learning from feedback

---

## CRITICAL GAPS THAT NEED IMMEDIATE RESOLUTION

Based on SPEC.md, these are the **most important unresolved questions** for implementation:

### Priority 1: Core Systems (Blocking)

**1. Quest Generation Architecture**
- SPEC says "AI-generated" but doesn't specify template library vs pure AI vs hybrid
- **Decision needed:** Confirm approach (recommend hybrid)
- **Impact:** Affects quest content creation, AI prompt design, data model

**2. Result Logging & Analysis System**
- SPEC says "self-reports completion/results" but no detail on UX or data model
- **Decision needed:** 
  - How results are collected (structured questions per quest type)
  - What data is captured
  - How AI analyzes results to recommend next quest
- **Impact:** Core loop depends on this

**3. Growth Profile / User State**
- SPEC has basic founder profile, but missing dynamic "learning" state
- **Decision needed:** Data structure for "what we've learned about this founder's growth"
- **Impact:** AI adaptation quality depends on this

**4. AI Coach Chat Interface**
- SPEC says not primary interface, but doesn't say if it exists at all
- **Decision needed:** Is there a chat interface? Where? How does it work?
- **Impact:** User experience and feature scope

**5. Templates & Tools System**
- SPEC doesn't mention templates, frameworks, or tools
- From discovery: You want Tier 2 automation (templates that help execution)
- **Decision needed:** What templates exist, how they're generated, where they live
- **Impact:** Value proposition and differentiation

### Priority 2: User Experience (High)

**6. Quest Structure Details**
- Need full quest data model (instructions, tools, result questions, etc.)
- **Impact:** Quest UI design and implementation

**7. User Journey Timing & Pacing**
- When is next quest available? Wait periods? Re-engagement logic?
- **Impact:** Retention and engagement

**8. Notification System**
- In-app + email notification rules
- **Impact:** User engagement and retention

**9. User-Facing Analytics**
- What does founder see in their dashboard beyond progress bar?
- **Impact:** Value perception and motivation

### Priority 3: Business Operations (Medium)

**10. Trial Strategy**
- SPEC Open Question: Pricing/tiers
- **Decision needed:** 14-day trial? Freemium? Free until first customer?
- **Impact:** Go-to-market strategy

**11. Admin Tools Minimum Scope**
- What admin capabilities needed at launch?
- **Impact:** Operations and support capacity

**12. Payment Failure Handling**
- Grace period policy
- **Impact:** Revenue protection and user experience

### Priority 4: Edge Cases (Lower but Important)

**13-17. Edge Case Handling**
- User reaches 100
- User loses customers
- User has 100+ at signup
- User pivots business
- User disagrees with recommendations
- **Impact:** Product robustness and user trust

---

## RECOMMENDED NEXT STEPS

**Option A: Answer Critical Gaps Only (Fastest)**
- Focus on Priority 1 (Core Systems) + Priority 2 (UX)
- Defer Priority 3-4 until later in implementation
- **Time estimate:** 1-2 hour discussion
- **Outcome:** Enough clarity to start detailed design

**Option B: Complete All Gap Decisions (Thorough)**
- Work through full questionnaire
- Address all 20 categories
- **Time estimate:** 3-4 hour session(s)
- **Outcome:** Comprehensive product definition, no blockers

**Option C: Use SPEC as Foundation, Fill Gaps Incrementally**
- Accept SPEC.md as primary source of truth
- Fill in missing details as we hit them during Phase 2-4
- Document decisions in amendments to SPEC
- **Time estimate:** Ongoing during design
- **Outcome:** Flexible, but might cause rework

**My recommendation: Option A (Critical Gaps)**

Focus on the 12 critical gaps (Priority 1 + 2), proceed to Phase 2, handle edge cases during later design phases.

---

## QUESTIONS FOR YOU

1. **Should we treat SPEC.md as the definitive source and just fill gaps?**
   - Or create new comprehensive product definition document?
   
2. **Which priority level do you want to resolve before Phase 2?**
   - Just Priority 1? (Core systems)
   - Priority 1 + 2? (Core + UX)
   - All priorities?

3. **For unresolved questions, do you want to:**
   - Make decisions now via discussion?
   - Defer to later phases?
   - Give me authority to make reasonable defaults?

4. **The SPEC.md seems to be an MVP-scoped document. Should we:**
   - Continue with MVP scope for design?
   - Or design complete product (as per original 20-phase plan)?

---

## ALIGNMENT CHECK

**SPEC.md says:** "MVP-scoped" with clear deferrals (visual map, badges, leaderboards, verification, multi-tier)

**Our earlier discovery conversation said:** "Build complete product, not MVP-limited"

**These seem contradictory.**

**Clarification needed:** 
- Is SPEC.md the MVP scope we're building?
- Or should we design the complete product beyond this MVP spec?
- If complete product, should we expand SPEC.md?

**Please clarify the intended scope before we proceed.**

