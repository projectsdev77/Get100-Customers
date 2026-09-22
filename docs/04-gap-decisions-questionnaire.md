# Gap Decisions Questionnaire

**Document Version:** 1.0  
**Date:** September 20, 2026  
**Purpose:** Make decisions on all identified gaps to complete product definition

---

## INSTRUCTIONS

This questionnaire covers all 20 gap categories identified in the gap analysis.

For each question:
- Review the options provided
- Select your preferred approach OR describe your own
- Add any clarifications or constraints
- Flag any questions where you need more context to decide

**Let's work through these systematically.**

---

## CATEGORY 1: ONBOARDING & USER CONTEXT

### Q1.1: Onboarding Data Collection

What information must we collect during onboarding?

**Proposed minimum required fields:**
- [ ] Business name
- [ ] Business model (B2B SaaS, B2C SaaS, Services, DTC)
- [ ] Business stage (idea, ready to sell, 0-10 customers, 10-50 customers, 50+)
- [ ] What are you selling? (Product/service description)
- [ ] Who is your target customer? (ICP description)
- [ ] Current customer count
- [ ] "Customer acquisition event" definition (what counts as a customer for you?)
- [ ] Country/location
- [ ] Target market geography

**Proposed optional/later fields:**
- [ ] Previous acquisition attempts (what have you tried?)
- [ ] Available budget for acquisition
- [ ] Time you can commit per week
- [ ] Team size
- [ ] Annual revenue (if any)
- [ ] Biggest challenge right now

**Questions:**
- Is this list complete? Anything missing?
- Which should be required vs optional?
- Should onboarding be multi-step or single long form?
- Can users skip sections and complete later?

**Your decision:**

---

### Q1.2: Context Updates Over Time

How do we keep user context current as their situation changes?

**Options:**
- **A:** User can edit profile anytime, but we don't proactively update
- **B:** System detects context drift and asks user to update (e.g., "Your results suggest your ICP might be different than you thought")
- **C:** Periodic "check-in" quests that re-validate context (every 10-25 customers, system asks context questions again)
- **D:** Combination of A + B + C

**Your decision:**

---

## CATEGORY 2: QUEST SYSTEM ARCHITECTURE

### Q2.1: Quest Generation Approach

Where do quests come from?

**Option A: Predefined Quest Library**
- Human experts write 100+ quest templates organized by:
  - Business model (B2B SaaS, B2C, Services, DTC)
  - Stage (idea, 0-1, 1-10, 10-25, 25-50, 50-100 customers)
  - Channel (cold email, content, paid ads, partnerships, etc.)
  - Situation (no leads, poor conversion, unclear ICP, etc.)
- AI selects best quest from library based on user context
- AI can customize quest details (personalize templates, adjust instructions)
- **Pros:** Quality control, proven tactics, faster to build
- **Cons:** Limited to what we pre-define, requires maintaining library

**Option B: Fully AI-Generated Quests**
- No predefined templates
- AI creates custom quest on-demand for each user's exact situation
- AI decides structure, instructions, tools, everything
- **Pros:** Maximum personalization, infinite flexibility
- **Cons:** Quality inconsistency, expensive, harder to optimize, no proven tactics

**Option C: Hybrid (Structured Library + AI Enhancement)**
- Core quest templates for common scenarios (maybe 50-100 templates)
- Each template defines:
  - Quest type/category
  - When to use it (context rules)
  - Base structure (objectives, steps)
  - Required tools/templates
  - Result questions
- AI customizes the quest heavily for user's context:
  - Personalizes all copy
  - Adapts instructions to their business
  - Generates custom templates
  - Explains why this quest for this user
- AI can also generate completely novel quests when templates don't fit
- **Pros:** Quality + flexibility, best of both worlds
- **Cons:** Most complex to build

**My strong recommendation: Option C (Hybrid)**

**Your decision:**

---

### Q2.2: Quest Structure Definition

What fields/components does a quest have?

**Proposed quest data model:**
```
Quest {
  id: unique identifier
  title: "Find Your First 10 Ideal Customer Profiles"
  category: "customer_discovery" | "outreach" | "conversion" | "positioning" | etc.
  objective: "Identify 10 specific people/companies who match your ICP"
  context_explanation: "Why this quest now for this user"
  
  instructions: [
    step1: "Define your ideal customer criteria"
    step2: "Research where these customers hang out"
    step3: "Find 10 specific examples"
  ]
  
  tools_provided: [
    "ICP criteria worksheet"
    "Research framework"
    "Customer profile template"
  ]
  
  estimated_time: "2-3 hours"
  expected_outcome: "List of 10 specific potential customers with contact info"
  
  success_criteria: "You have identified 10 people/companies with contact details"
  
  result_questions: [
    "How many potential customers did you identify?"
    "Where did you find them?"
    "How confident are you they match your ICP?"
    "What surprised you during research?"
  ]
  
  dependencies: [] // prerequisites before starting
  unlocks: [] // what becomes available after completing
}
```

**Questions:**
- Is this structure complete?
- Should quests have sub-tasks/checklist items?
- Should quests have deadlines/time pressure?
- Can user mark quest as "blocked" or "need help"?

**Your decision:**

---

### Q2.3: Quest Recommendation Logic

How does system decide which quest to give next?

**Approach:**
- AI-driven decision using comprehensive context
- System passes to Gemini API:
  - User's full profile (business model, stage, ICP, etc.)
  - Current customer count and progress
  - All previous quests and their results
  - What's worked vs failed
  - Identified bottlenecks
  - User's available resources
  - Current stage/chapter
- AI recommends next quest with reasoning
- System validates recommendation makes sense
- If using quest library (hybrid approach), AI picks from library then customizes

**Questions:**
- Should we show user WHY a quest was recommended?
- Should user see alternative quests? (Pick from 2-3 options)
- Or just show the single best recommended quest?
- Can user request different quest if they disagree?

**Your decision:**

---

### Q2.4: Quest Lifecycle & States

What are the possible states of a quest?

**Proposed states:**
- **Recommended:** System suggests, user hasn't started
- **Active:** User has started, currently working on it
- **Waiting for Results:** User completed actions, waiting for outcomes (e.g., sent 20 emails, waiting for responses)
- **Ready to Log Results:** Enough time has passed, user should log what happened
- **Completed:** User finished and logged results
- **Skipped:** User chose not to do this quest
- **Blocked:** User can't proceed, needs help
- **Paused:** User started but paused for now

**Questions:**
- Can user have multiple active quests? **My recommendation: No, one at a time for focus**
- What happens to old completed quests? **Archive but keep visible in history**
- Can user "retry" a quest with different approach? **Yes**

**Your decision:**

---

## CATEGORY 3: AI COACH CHAT INTERFACE

### Q3.1: Chat Interface Location

Where does AI coach chat live in the UI?

**Options:**
- **A:** Always-visible sidebar (like many AI chat tools)
- **B:** Floating chat bubble (bottom right, like support chat)
- **C:** Click to open full-screen modal
- **D:** Contextual chat within each quest screen
- **E:** Dedicated "Ask Coach" page/tab

**My recommendation: Option B (Floating bubble) or D (Contextual)**
- Bubble for general coach questions
- Contextual chat when inside a quest

**Your decision:**

---

### Q3.2: Chat Context & Memory

When user opens chat, what context does AI have?

**Proposed approach:**
- AI always has access to:
  - User's current quest (if any)
  - User's profile and business context
  - Last 5-10 quest results (recent history)
  - Why current quest was recommended
- AI can reference full history if needed for specific questions
- Chat maintains conversation context within session
- Chat history is saved and searchable

**Questions:**
- Should there be "quest-specific chat" vs "general coach chat"?
- Or just one unified chat that's context-aware?

**Your decision:**

---

## CATEGORY 4: RESULT ANALYSIS & LEARNING SYSTEM

### Q4.1: Result Analysis Approach

How does system analyze quest results and adapt strategy?

**Proposed approach: Hybrid (Structured Data + AI Analysis)**

**Process:**
1. User completes quest
2. User logs results via structured questions
3. System stores structured data (metrics, counts, feedback)
4. System calculates quantitative metrics automatically (conversion rates, velocity, etc.)
5. AI analyzes results using:
   - Structured data
   - User's qualitative feedback
   - Historical context
   - Business model best practices
6. AI identifies:
   - Did this work? (yes/no/partially)
   - Why or why not?
   - What's the likely bottleneck?
   - What should user try next?
7. AI updates user's "growth profile"
8. AI recommends next quest based on learnings

**Example:**

User completes "Cold Email Outreach" quest:
- Contacted: 20 people
- Opened: 8 (40% open rate)
- Responded: 0 (0% response rate)
- Became customers: 0

AI analysis:
- "Opens are decent, but zero responses suggests message isn't resonating"
- Likely bottleneck: Message/offer fit, or targeting
- Next quest recommendation: "Refine Your Value Proposition" or "Validate Your ICP Through Interviews"

**Questions:**
- Should AI analysis happen immediately when results are logged?
- Or batch process daily?
- Should user see the AI's analysis reasoning?

**Your decision:**

---

### Q4.2: Growth Profile / User State

What data structure captures what we've learned about the user?

**Proposed "Growth Profile" data model:**

```
GrowthProfile {
  user_id: reference to user
  
  // Current state
  current_stage: "customer_discovery" | "early_traction" | "scaling"
  current_customer_count: 7
  customer_acquisition_rate: 1.2 per week (calculated)
  
  // What we know about their business
  validated_icp: "B2B SaaS founders, pre-seed, 0-5 customers, US"
  validated_offer: "AI growth coach for first 100 customers"
  validated_positioning: "Like having a growth advisor, but 24/7 and personalized"
  
  // What's working
  effective_channels: ["cold_email", "founder_communities"]
  effective_messages: ["saved message examples"]
  conversion_funnel: {
    outreach_to_response: 15%
    response_to_meeting: 60%
    meeting_to_customer: 30%
    overall: 2.7%
  }
  
  // What's not working
  failed_tactics: [
    {tactic: "linkedin_cold_outreach", reason: "low_response_rate", tried: "2024-09-15"}
  ]
  
  // Identified bottlenecks
  current_bottlenecks: ["closing", "not_enough_leads"]
  
  // User patterns
  user_strengths: ["good_at_interviews", "comfortable_with_outreach"]
  user_challenges: ["struggles_with_paid_ads", "limited_budget"]
  
  // Strategy evolution
  strategy_history: [
    {date: "2024-09-01", strategy: "cold_email", result: "working"},
    {date: "2024-09-10", strategy: "added_content_marketing", result: "too_early_to_tell"}
  ]
  
  // Learning insights
  insights: [
    "ICP responded well to 'free trial' offer",
    "Objection: price is too high for pre-revenue startups",
    "Best times to contact: Tue-Thu mornings"
  ]
  
  last_updated: timestamp
}
```

**Questions:**
- Is this structure on the right track?
- What's missing?
- How often should this be updated?

**Your decision:**

---

## CATEGORY 5: STAGES/CHAPTERS SYSTEM

### Q5.1: Chapter Structure

What are the stages/chapters of the journey?

**Proposed structure: Milestone-based with narrative framing**

```
Chapter 1: "First Customer" (0 → 1 customer)
- Focus: Prove someone will pay you
- Key activities: ICP validation, offer refinement, manual outreach
- Typical duration: 1-4 weeks

Chapter 2: "Finding Traction" (1 → 10 customers)
- Focus: Identify what's working, repeat it
- Key activities: Channel experimentation, message refinement, process documentation
- Typical duration: 1-3 months

Chapter 3: "Building Momentum" (10 → 25 customers)
- Focus: Scale what works, build systems
- Key activities: Optimize funnel, improve conversion, automate repetitive tasks
- Typical duration: 1-3 months

Chapter 4: "Scaling Systems" (25 → 50 customers)
- Focus: Systematic acquisition, multiple channels
- Key activities: Multi-channel strategy, team/tool leverage, data-driven optimization
- Typical duration: 2-4 months

Chapter 5: "Reaching 100" (50 → 100 customers)
- Focus: Accelerate and optimize
- Key activities: Scale top channels, improve efficiency, prepare for beyond 100
- Typical duration: 2-4 months
```

**Questions:**
- Are these the right chapters?
- Right customer count milestones?
- Should chapters change based on business model?

**Your decision:**

---

### Q5.2: Chapter Transitions

What happens when user moves to next chapter?

**Proposed transition experience:**
- User hits milestone (e.g., 10 customers)
- System celebrates achievement (animation, special message)
- "Chapter Complete" screen
- AI analyzes what worked in this chapter
- "Chapter X Summary" showing key learnings
- "Next Chapter Preview" explaining what changes
- First quest of new chapter is recommended
- New tactics/templates may unlock

**Questions:**
- Should there be "boss battle" milestone challenges?
- Or just natural progression?

**Your decision:**

---

## CATEGORY 6: XP, LEVELS, AND PROGRESSION

### Q6.1: XP System

What earns XP and how much?

**Proposed XP structure:**

**Quest-related:**
- Start a quest: 10 XP
- Complete quest (log results): 50 XP
- Quest leads to customer: bonus 100 XP

**Customer acquisition:**
- First customer: 500 XP (huge milestone)
- Each additional customer: 100 XP
- Reach 10 customers: bonus 500 XP
- Reach 25 customers: bonus 750 XP
- Reach 50 customers: bonus 1000 XP
- Reach 100 customers: bonus 5000 XP

**Learning & adaptation:**
- Log results (even if failed): 25 XP
- Try new tactic: 50 XP
- Pivot strategy after analysis: 100 XP

**Consistency:**
- Complete quest within recommended timeline: bonus 25 XP
- Active 3 days in a row: 50 XP bonus
- Active 7 days in a row: 150 XP bonus

**Important:** Do NOT punish for reporting bad results

**Questions:**
- Are these XP amounts reasonable?
- Should XP scale with difficulty/impact?
- Should we avoid XP for consistency? (Might create fake metrics)

**Your decision:**

---

### Q6.2: Levels System

What do levels represent and how many are there?

**Proposed approach: 20 levels (0 → 20)**

**Level progression tied to real progress:**
- Level 1-5: Early exploration (0-10 customers)
- Level 6-10: Finding channels (10-25 customers)
- Level 11-15: Building systems (25-50 customers)
- Level 16-20: Scaling to 100 (50-100 customers)

**Leveling up unlocks:**
- New quest types
- Advanced templates
- More sophisticated tactics
- Deeper analytics

**Questions:**
- Should levels be pure XP-based? Or tied to customer milestones?
- My recommendation: Hybrid (need both XP AND customer progress to level up)
  - Example: Level 5 requires 2000 XP + at least 5 customers

**Your decision:**

---

### Q6.3: Achievements/Badges

What triggers achievements?

**Proposed achievement categories:**

**Milestones:**
- First Customer
- 10 Customers
- 25 Customers  
- 50 Customers
- 100 Customers (ultimate achievement)

**Tactics:**
- First Cold Email Quest
- First Content Quest
- First Paid Ad Quest
- Mastered [Channel] (10+ customers from this channel)

**Learning:**
- Failed Fast (tried tactic, learned it didn't work, pivoted quickly)
- Data-Driven (logged results consistently for 10 quests)
- Strategic Pivot (changed strategy based on data, and it worked)

**Consistency:**
- Week Warrior (active 7 days straight)
- Month Master (active 30 days straight)

**Discovery:**
- ICP Found (validated target customer)
- Channel Found (identified working acquisition channel)
- Message-Market Fit (found messaging that resonates)

**Questions:**
- How many achievements total?
- Do achievements unlock anything? Or just recognition?

**Your decision:**

---

## CATEGORY 7: UNLOCKS SYSTEM

### Q7.1: Unlock Philosophy

Should tactics/features be locked initially and unlock with progress?

**Option A: Everything Available (No artificial locks)**
- User has access to all quest types from day one
- System still recommends based on what's appropriate
- User can explore and choose different paths
- **Pro:** No artificial restrictions, user autonomy
- **Con:** Might be overwhelming, analysis paralysis

**Option B: Progressive Unlocks**
- Basic tactics available initially
- Advanced tactics unlock at higher levels/milestones
- Forces user through proven progression
- **Pro:** Prevents overwhelm, guided journey
- **Con:** Might feel restrictive, not truly personalized

**Option C: Contextual Unlocks**
- Tactics unlock when user proves they're ready
- Example: Paid ads unlock after getting 10 customers organically (proves offer works)
- Example: Multi-channel unlock after mastering one channel
- **Pro:** Unlocks feel earned and logical
- **Con:** Complex logic to manage

**My recommendation: Option C (Contextual unlocks based on readiness)**

**Your decision:**

---

### Q7.2: What Gets Unlocked?

**Proposed unlock structure:**

**Always available:**
- Customer discovery quests
- Basic outreach tactics
- Simple templates
- Interview guides

**Unlock after 1 customer:**
- Channel expansion quests
- Conversion optimization tactics

**Unlock after 10 customers:**
- Paid acquisition tactics (ads)
- Multi-channel strategies
- Advanced analytics

**Unlock after 25 customers:**
- Scaling/automation quests
- Team leverage tactics
- Advanced funnel optimization

**Unlock after 50 customers:**
- Systematic growth strategies
- Data-driven optimization
- Preparation for beyond 100

**Your decision:**

---

## CATEGORY 8: TEMPLATES & TOOLS

### Q8.1: Template Personalization Level

How personalized should templates be?

**Proposed approach: Hybrid (Base templates + AI personalization)**

**Process:**
1. System has base template for each use case
2. When user needs template, AI personalizes it using:
   - User's business model
   - Their ICP
   - Their offer/value prop
   - Their positioning
   - Context of current quest
3. AI generates personalized template
4. User can edit before using
5. If user saves edited version, system learns their preferences

**Example - Cold Email Template:**

**Base template:**
```
Subject: [PAIN_POINT_QUESTION]

Hi [NAME],

I noticed [OBSERVATION_ABOUT_THEM].

[PROBLEM_STATEMENT]

[OFFER_SOLUTION]

[SMALL_ASK]

[SIGNATURE]
```

**AI-personalized for user:**
```
Subject: Struggling to get your first customers?

Hi [NAME],

I noticed you're building [THEIR_PRODUCT] for [THEIR_MARKET].

Getting the first 10-20 customers is brutal. Most founders waste months on tactics that don't work for their specific business.

I built Get100 - an AI coach that gives you personalized quests to acquire customers. Think of it like having a growth advisor, but 24/7.

Would you be open to trying it? I'm offering free access to the first 50 early-stage founders.

Best,
[USER_NAME]
```

**Questions:**
- Is this level of personalization right?
- Should users be able to save and reuse their edited templates?

**Your decision:**

---

### Q8.2: Template Library Organization

How should templates be organized?

**Proposed structure:**
- By channel (Email, LinkedIn, Content, Ads, etc.)
- By use case (Cold outreach, Warm intro, Follow-up, etc.)
- By business model (variations for B2B vs B2C vs Services)
- By stage (Early stage vs growth stage messaging)

**Searchable and filterable**

**Questions:**
- Should users see full template library?
- Or only templates relevant to current quest?

**Your decision:**

---

## CATEGORY 9: USER JOURNEY TIMING & PACING

### Q9.1: Quest Availability

When next quest becomes available after completing previous?

**Proposed logic:**

**If quest requires waiting for results:**
- Quest marked "Waiting for Results"
- System suggests return date (e.g., "Check back in 3 days")
- Email reminder sent when time's up
- User can return earlier if results come sooner

**If quest was completed with immediate results:**
- Next quest available immediately
- But system shows: "Take a break, or start next quest"
- No pressure to rush

**If quest failed/blocked:**
- System immediately offers:
  - Try different approach (alternative quest)
  - Get help (chat with AI coach)
  - Skip and try something else

**Questions:**
- Can user have multiple active quests?
- My recommendation: No, focus on one quest at a time

**Your decision:**

---

### Q9.2: Inactive User Handling

What happens when user doesn't return?

**Proposed re-engagement strategy:**

**Day 3 after expected return:** Gentle email reminder
- "Your experiment should have results by now"
- "Ready to log what happened?"

**Day 7 of inactivity:** Motivational email
- "We miss you! How's your quest going?"
- "Need help? Let's chat"

**Day 14 of inactivity:** Value reminder + offer help
- "Getting your first customers is hard"
- "Our AI can help you get unstuck"
- Link to easy-win quest

**Day 30 of inactivity:** Last engagement attempt
- "Should we pause your journey?"
- "Or try a different approach?"

**Day 60+ of inactivity:** Soft churn
- Stop active engagement emails
- Switch to monthly newsletter only

**Questions:**
- Is this cadence right?
- Too aggressive? Too passive?

**Your decision:**

---

### Q9.3: Pacing by Business Model

Should pacing adapt to business model?

**Proposed approach:**

**System sets expectations during onboarding based on business model:**

- B2B SaaS: "Typical timeline: 3-6 months to 100 customers"
- B2C SaaS: "Typical timeline: 2-4 months to 100 customers"
- Services: "Typical timeline: 4-8 months to 100 customers"
- DTC: "Typical timeline: 1-3 months to 100 customers"

**System adapts quest pacing:**
- Short sales cycle (DTC) → quests can be frequent
- Long sales cycle (B2B services) → quests spaced out, focus on patience

**Questions:**
- Should we show user their expected timeline?
- Or keep it implicit?

**Your decision:**

---

## CATEGORY 10: CUSTOMER TRACKING

### Q10.1: Customer Logging Method

How does user log new customers?

**Proposed approach: Simple counter + optional details**

**Primary flow:**
1. User clicks "I got a customer!" button
2. Simple form appears:
   - Customer count: [Previous count + 1] (editable)
   - When: [Today] (date picker)
   - Source: Dropdown (Which quest/channel led to this?)
   - (Optional) Notes: Any details you want to remember

**Batch update option:**
- "Update my count" in header
- User can jump from 5 → 8 customers
- System asks: "Great! Tell us about these 3 customers"

**Questions:**
- Is this simple enough?
- Should we require more data?
- Should we allow bulk import (e.g., CSV from CRM)?

**Your decision:**

---

### Q10.2: Customer Data Detail

What data do we collect per customer?

**Proposed: Minimal with optional detail**

**Required:**
- Acquisition date
- Customer count increment

**Optional (helps AI, but not required):**
- Source/channel (which quest/tactic led to this)
- Customer segment (which ICP fit)
- Deal value (if applicable)
- How long did acquisition take (first contact to close)

**NOT collected (privacy):**
- Customer name
- Customer email
- Customer company name

**Questions:**
- Is this the right balance?
- More detail = better AI, but more friction

**Your decision:**

---

## CATEGORY 11: NOTIFICATIONS & COMMUNICATION

### Q11.1: In-App Notification Rules

When do we show in-app notifications?

**Proposed triggers:**

**Quest-related:**
- New quest available
- Quest results analyzed, next steps ready
- Quest deadline approaching (if we have deadlines)

**Progress-related:**
- Milestone reached (10, 25, 50 customers)
- Level up
- Achievement unlocked
- Chapter complete

**System-related:**
- AI coach has analyzed your results
- Important insight discovered
- Strategy recommendation changed

**Questions:**
- Should notifications be dismissible?
- Should they have action buttons?
- Max notifications per day?

**Your decision:**

---

### Q11.2: Email Notification Rules

When do we send emails?

**Proposed email triggers:**

**Quest follow-ups:**
- Quest ready for result logging (after wait period)
- Quest has been active for 7 days without completion

**Re-engagement:**
- Haven't logged in for 3 days (if quest was active)
- Haven't logged in for 7 days
- Haven't logged in for 14 days

**Milestone celebrations:**
- Reached 1, 10, 25, 50, 100 customers
- Chapter complete
- Major achievement unlocked

**Weekly summary:**
- Progress this week
- What's next
- Insights discovered

**System:**
- Payment failed
- Trial ending soon
- Subscription renewed

**Questions:**
- Can user customize email preferences?
- Which emails can they opt out of?

**Your decision:**

---

## CATEGORY 12: SUBSCRIPTION & MONETIZATION

### Q12.1: Trial Strategy

What trial approach should we use?

**Options:**

**Option A: 14-day free trial**
- Full access for 14 days
- Credit card required upfront
- Auto-converts to paid after trial
- **Pro:** Standard, proven approach
- **Con:** Credit card barrier

**Option B: Freemium (limited free forever)**
- Free tier: 3 quests per month + limited templates
- Paid tier: Unlimited quests + all features
- **Pro:** No credit card barrier, viral potential
- **Con:** Some users never convert

**Option C: Free until first customer**
- Completely free until user acquires their first customer
- Then paywall with "you've proven it works, keep going"
- **Pro:** Aligned with value delivery
- **Con:** Might take months before payment

**Option D: No trial, paid from day one**
- Low price point (e.g., $29/month)
- No trial, immediate value
- **Pro:** Qualifies serious users, immediate revenue
- **Con:** Higher barrier to entry

**My recommendation: Option A (14-day free trial) or C (Free until first customer)**

**Your decision:**

---

### Q12.2: Pricing Tiers

Single tier or multiple tiers?

**Proposed: Start with single tier, expand later**

**Initial: One Plan**
- Get100 Pro: $49/month or $490/year (save $98)
- Unlimited quests
- Unlimited AI coach access
- All templates and tools
- Email support

**Future tiers (if needed):**
- Starter: $29/month - 5 quests/month, limited AI
- Pro: $49/month - Unlimited everything
- Team: $99/month - Multi-user access

**Questions:**
- Start simple or build tiers now?
- My recommendation: Single tier initially

**Your decision:**

---

### Q12.3: Payment Failure Handling

What happens when payment fails?

**Proposed grace period:**

**Day 0:** Payment fails, silent retry
**Day 1:** Email notification, retry scheduled
**Day 3:** Second email, urgent notice, retry
**Day 7:** Account suspended (read-only mode)
- Can view data, cannot start new quests
- Big banner: "Update payment to continue"
**Day 14:** Account locked
- Cannot access anything except payment page
**Day 30:** Account flagged for deletion warning
**Day 60:** Data deleted

**Questions:**
- Is this too lenient? Too aggressive?
- Should we retry payments automatically?

**Your decision:**

---

## CATEGORY 13: ADMIN & OPERATIONAL TOOLS

### Q13.1: Admin Dashboard Minimum Features

What admin capabilities do we need at launch?

**Proposed minimum admin features:**

**User management:**
- View all users (list + search)
- User detail page (see their journey, quests, results)
- User impersonation (for support)
- Manually adjust customer count (if user made mistake)
- View user's growth profile

**Subscription management:**
- View subscription status
- Issue refunds
- Cancel subscriptions
- Extend trials
- Grant free access

**Content management:**
- View quest templates
- Edit quest templates (for fixes)
- View tactic library
- Add/edit templates

**Analytics:**
- Platform-wide metrics dashboard
- User progress distribution
- Popular quests
- Success rates by business model
- AI cost tracking

**Support:**
- View user support tickets (if we have support system)
- Send message to user

**Questions:**
- Is this minimum viable?
- What's critical vs nice-to-have?

**Your decision:**

---

### Q13.2: Content Management Approach

How do we manage quest templates and content?

**Options:**

**Option A: Database + Admin UI**
- Content stored in database
- Admin panel to edit
- Non-technical people can edit
- **Pro:** Easy for non-devs
- **Con:** More complex to build

**Option B: Code-based (JSON/Markdown files)**
- Content in repository
- Edit via code/files
- Deploy to update
- **Pro:** Version control, simpler
- **Con:** Requires technical skill

**Option C: Hybrid**
- Core templates in code
- Customizations/overrides in database
- **Pro:** Balance of control
- **Con:** Most complex

**My recommendation: Option B initially (code-based), migrate to A later if needed**

**Your decision:**

---

## CATEGORY 14: DATA PRIVACY & SECURITY

### Q14.1: Authentication Approach

How do users sign up and log in?

**Proposed approach:**

**Primary: Email + Password**
- Standard email/password authentication
- Email verification required
- Password reset via email
- Password requirements: 8+ chars, mix of letters/numbers

**Optional: OAuth (Social Login)**
- "Sign up with Google"
- Maybe: GitHub, LinkedIn
- Faster signup, less friction

**Security:**
- Passwords hashed (bcrypt)
- Sessions with secure cookies
- Optional 2FA (later)

**Auth provider options:**
- Supabase Auth (integrated with Supabase if we use it for DB)
- Clerk (specialized auth service)
- Auth0 (enterprise-grade)
- Roll our own (most work, most control)

**My recommendation: Supabase Auth (if using Supabase) or Clerk**

**Your decision:**

---

### Q14.2: Data Privacy Compliance

What privacy requirements must we meet?

**Proposed compliance approach:**

**GDPR (EU users):**
- Clear consent for data collection
- Right to access data (user can export)
- Right to deletion (user can delete account + all data)
- Data processing agreement
- Privacy policy

**CCPA (California users):**
- Similar to GDPR
- Right to know what data we collect
- Right to delete

**General privacy principles:**
- Collect minimum data necessary
- Don't sell user data
- Secure storage
- Transparent about AI usage
- Clear terms of service

**Questions:**
- Do we need data processing agreements?
- Do we need cookie consent banners?

**Your decision:**

---

## CATEGORY 15: PERFORMANCE & SCALE

### Q15.1: Expected Scale

What are realistic user numbers?

**Your estimates:**
- Launch: ??? users
- Month 1: ??? users
- Month 6: ??? users
- Year 1: ??? users

**Questions:**
- What's your growth expectation?
- This affects infrastructure choices

**Your decision:**

---

### Q15.2: AI Cost Management

How do we manage Gemini API costs?

**Cost estimation:**
- Quest recommendation: ~$0.01-0.05 per quest
- Result analysis: ~$0.01-0.05 per analysis
- AI coach chat: ~$0.01-0.10 per conversation
- Template generation: ~$0.005-0.02 per template

**Estimated per user per month:** $2-10 in AI costs

**If subscription is $49/month, this is 4-20% of revenue**

**Mitigation strategies:**
- Cache common recommendations
- Use cheaper models for simple tasks
- Implement rate limits if needed
- Optimize prompts for token efficiency

**Questions:**
- What's acceptable AI cost as % of revenue?
- Should we set usage limits per tier?

**Your decision:**

---

## CATEGORY 16: MOBILE CONSIDERATIONS

### Q16.1: Mobile Support

What's the mobile strategy?

**Options:**

**Option A: Desktop-only initially**
- Build for desktop first
- Mobile later
- **Pro:** Faster to build
- **Con:** Limits access

**Option B: Responsive web from day one**
- Works on desktop + mobile browsers
- Same codebase
- **Pro:** Accessible anywhere
- **Con:** Slightly more work

**Option C: Native mobile apps**
- iOS + Android apps
- **Pro:** Best mobile experience
- **Con:** Much more work

**My strong recommendation: Option B (Responsive web)**

Most serious work happens on desktop, but users should be able to check progress, log results, chat with AI from mobile.

**Your decision:**

---

## CATEGORY 17: INTERNATIONALIZATION

### Q17.1: Localization Approach

How do we handle multiple languages in the future?

**Proposed approach:**

**Phase 1 (Now): English-only, i18n-ready**
- All UI text in constant files (not hardcoded)
- Use i18n library (like react-intl or next-intl)
- English is default
- Architecture ready for translation

**Phase 2 (Future): Add languages**
- Spanish
- Portuguese
- French
- Others based on demand

**Questions:**
- Should we build i18n support now even if English-only?
- My recommendation: Yes, it's easier to build in than retrofit

**Your decision:**

---

### Q17.2: Currency & Localization

How do we handle global users?

**Proposed:**
- Price in USD globally (simple)
- Display conversions in local currency (informational)
- Accept payments in any currency (Stripe handles)
- Date/time formatting by user locale
- Number formatting by user locale

**Questions:**
- Should we offer regional pricing?
- Or same USD price globally?

**Your decision:**

---

## CATEGORY 18: ANALYTICS & OBSERVABILITY

### Q18.1: User-Facing Analytics

What analytics do users see in their dashboard?

**Proposed dashboard widgets:**

**Progress Overview:**
- Customer count progress bar (0 → 100)
- Current chapter/stage
- Days active
- Quests completed

**Acquisition Metrics:**
- Customers acquired this week/month
- Acquisition rate trend (chart)
- Time to each milestone
- Projected time to 100 customers

**Channel Performance:**
- Which tactics have worked
- Which are in progress
- Which failed (lessons learned)

**Funnel Analysis:**
- If user has tracked funnel data
- Show conversion rates at each stage

**Questions:**
- How detailed should user analytics be?
- Real-time or updated daily?

**Your decision:**

---

### Q18.2: Internal Analytics Stack

What tools do we use to monitor the platform?

**Proposed stack:**

**Error tracking:** Sentry
- Track errors, exceptions
- Performance monitoring

**User behavior:** Mixpanel or Amplitude
- User flows
- Feature usage
- Conversion funnels
- Cohort analysis

**Business metrics:** Internal dashboard
- MRR, churn, conversions
- AI costs per user
- Quest completion rates
- Success rates by business model

**Questions:**
- Is this stack right?
- Any specific preferences?

**Your decision:**

---

## CATEGORY 19: AI QUALITY ASSURANCE

### Q19.1: AI Testing Strategy

How do we ensure AI gives good recommendations?

**Proposed approach:**

**Phase 1: Human-in-the-loop**
- First 50-100 users: Manual review of all AI recommendations before they go live
- Collect feedback on quality
- Build "golden dataset" of good recommendations

**Phase 2: Automated quality checks**
- Automated tests on golden dataset
- Regression testing when prompts change
- A/B testing different prompts

**Phase 3: User feedback loop**
- "Was this helpful?" after each quest
- Track which quests lead to customers
- Continuously improve based on data

**Questions:**
- Should we have human review initially?
- Or trust AI from day one?

**Your decision:**

---

### Q19.2: AI Failure Handling

What happens when AI fails?

**Proposed fallbacks:**

**If AI API fails:**
- Show cached previous recommendation
- Or show default "safe" quest
- Error message: "AI temporarily unavailable, showing default recommendation"

**If AI gives inappropriate content:**
- Content moderation filter
- Reject outputs with profanity, bias, etc.
- Fallback to template

**If user reports bad recommendation:**
- "Not relevant for me" button
- Request alternative quest
- System logs feedback for improvement

**Your decision:**

---

## CATEGORY 20: EDGE CASES & ERROR STATES

### Q20.1: User Reaches 100 Customers

What happens when user hits the goal?

**Proposed experience:**

**Immediate:**
- Epic celebration animation
- "You did it! 100 customers!"
- Journey summary (how long, what worked, key milestones)
- Certificate or achievement

**Then:**
- "What's next?" screen
- Options:
  - Continue to 200 customers (if we build this)
  - Celebrate and graduate (end of journey)
  - Get advice on what to focus on now (retention, growth, etc.)

**Subscription:**
- Offer discount if they continue ("You've proven the value")
- Or graduation discount on annual plan
- Or access to "alumni" features (if we build)

**Questions:**
- Should product end at 100?
- Or continue with "Post-100" mode?

**Your decision:**

---

### Q20.2: User Loses Customers (Churn)

What if customer count goes DOWN?

**Proposed handling:**

- Allow user to reduce customer count
- System asks: "What happened?"
- AI analyzes: Is there a churn problem?
- Recommend retention-focused quests
- Track net customers (acquired - churned)

**Questions:**
- Should we track gross vs net customers?
- How does churn affect progression?

**Your decision:**

---

### Q20.3: User Has 100+ Customers at Signup

What if they're already past the goal?

**Options:**

**Option A: Don't allow signup**
- "Congrats! You've already hit 100. This product isn't for you."
- **Pro:** Clear boundaries
- **Con:** Might lose potential customers

**Option B: Allow with different journey**
- "Focus on next milestone: 200 customers"
- Or "Focus on optimization/retention"
- **Pro:** Doesn't turn away users
- **Con:** Product might not fit their needs

**My recommendation: Option A (politely decline)**

**Your decision:**

---

### Q20.4: User Pivots Business

What if user completely changes their business?

**Proposed handling:**

- Detect significant profile changes
- System asks: "Looks like your business changed. Want to start a new journey?"
- Options:
  - Reset journey (keep historical data)
  - Continue current journey (update profile)
  - Archive old journey, start fresh

**Your decision:**

---

### Q20.5: User Disagrees with Recommendations

What if user refuses to do recommended quests?

**Proposed handling:**

- "Skip this quest" button always available
- System asks: "Why skip?" (learn from feedback)
- Offer alternative quest
- AI learns user preferences over time
- If user skips 3+ quests in a row, offer to chat with coach to realign

**Your decision:**

---

## COMPLETE THE QUESTIONNAIRE

Please go through each category and provide your decisions, preferences, and any additional context.

For each question, you can:
- Select from provided options
- Propose alternative approach
- Ask for clarification
- Defer decision if needed (but note why)

**Once you've completed this questionnaire, we'll have everything needed to proceed to Phase 2: Complete Product Definition.**

