# Phase 1: Discovery Answers

**Document Version:** 1.0  
**Date:** September 20, 2026  
**Status:** In Progress

---

## CRITICAL CLARIFICATIONS

### Product Scope
- **NOT an MVP** - We are designing the complete Get100 Customers platform
- **Lovable prototype** = visual reference and concept only, not scope constraint
- **Implementation phases** = logical build order, not feature limitations
- **Goal:** Complete working product with all necessary features

### Product Independence
- Get100 Customers is **independent**, not part of a bootcamp family
- Should not inherit architecture from other projects
- High-level principles borrowed: proactive guidance, structured progression, automation, tracking, feedback
- Implementation approach: completely independent

---

## ANSWERED QUESTIONS

### 1.1 What Counts as a "Customer"?

**Answer:** User-configurable, system-guided

**Implementation:**
- During onboarding, system suggests "customer acquisition event" definition based on business model
- User confirms or modifies definition
- Examples by business model:
  - B2B SaaS → Paid subscriber
  - B2C App → Active user or paid user
  - Service business → Signed contract
  - DTC → Completed purchase
  - Marketplace → Transaction completion (buyer/seller definition TBD)
- System tracks progress toward 100 based on user's definition

**Architecture Impact:**
- Need flexible "conversion event" schema
- Business model taxonomy in onboarding
- Customizable progress tracking
- Event definition stored per user

---

### 1.2 Supported Business Types

**Answer:** Multi-model from day one, not single-model focus

**Priority business types (initial depth):**
1. B2B SaaS
2. B2C SaaS/apps
3. Service businesses / agencies / consulting
4. DTC / E-commerce

**Post-launch additions:**
- Creator businesses
- Marketplaces
- Local businesses
- Specialized models

**Core principle:**
- AI understands customer acquisition as general problem
- Adapts strategy based on: business model, target customer, offer, sales cycle, current situation
- Architecture must support adding business models without redesign

**AI Knowledge Architecture:**
Not "AI training" in the sense of training a foundation model. Distinguish:
- ✅ Model capabilities (LLM selection)
- ✅ System prompts/instructions
- ✅ Business/growth knowledge base
- ✅ Tactic and template libraries (organized by business model)
- ✅ User-specific context
- ✅ Historical results and feedback
- ✅ Retrieval/RAG if needed
- ⚠️ Model fine-tuning (only if proven necessary)

**Open question:** What architecture gives deep expertise without custom model training? (RAG + structured knowledge base? Prompt engineering? Hybrid?)

---

### 1.3 Required Business Stage

**Answer:** Support idea-stage through 100 customers, stay focused on acquisition

**Supported entry points:**
- Idea / pre-launch
- Product or service ready to sell
- 0–10 customers
- 10–50 customers  
- 50+ customers (edge case, but can continue to 100)

**Adaptive journey by stage:**

**Idea-stage path:**
1. Identify target customer
2. Define/validate problem and offer
3. Find potential customers
4. Run validation/outreach
5. Learn from responses
6. Improve positioning/offer
7. Acquire first customers

**Product-ready path:**
1. Identify ICP
2. Choose acquisition strategy
3. Execute quests
4. Measure results
5. Adapt
6. Acquire customers

**Critical constraint:**
- Stay focused on customer discovery, validation, acquisition, learning from market
- Do NOT become general product development coach
- Central objective always: **Help user get their first 100 customers**

**Architecture Impact:**
- Onboarding must capture current stage
- Journey/quest logic adapts to stage
- Different quest libraries per stage
- Progress tracking works across stages

---

### 1.4 Geographic Scope

**Answer:** Global from day one, English language initially

**No geographic restrictions**

**User context captures:**
- Country
- Target market / countries
- Where customers are located
- Currency
- Business model
- Relevant industry
- Possibly regulatory considerations

**AI adapts tactics for regional differences:**
- Privacy regulations (GDPR, CCPA, etc.)
- Cold outreach rules
- Available advertising platforms
- Payment methods
- Local communication/cultural differences
- Market-specific channels

**Principle:** Don't hard-code around US growth tactics

**Architecture Impact:**
- Country/region fields in user profile
- Regional rules/constraints in knowledge base
- Tactic filtering by geography
- Currency handling
- Potential localization framework (future)

---

### 1.5.1 Video Game Experience

**Answer:** Quest-based RPG with dynamic quest selection (not rigid tree)

**Main Quest:** GET YOUR FIRST 100 CUSTOMERS

**Journey structure:**
- Can have stages/chapters
- Quests dynamically selected based on user situation
- Same customer count doesn't mean same quest

**Personalization factors:**
- Business model
- Target customer
- Current situation (leads vs conversion vs product issues)
- What's working vs not working
- User capabilities and resources

**Game mechanics (possible):**
- Main quest
- Chapters/stages
- Quests
- Missions
- Milestones
- XP
- Levels
- Rewards
- Unlocks
- Progress toward 100 customers
- Challenges / boss-style milestones

**CRITICAL PRINCIPLE:**
- Gamification supports real objective
- **Getting customers = actual progression**
- Don't reward "fake progress" (XP without business results)
- Reward meaningful actions and real progress

**Example contrast:**
- ❌ Bad: User earns 5000 XP but made no business progress
- ✅ Good: User completes quest → gets 2 customers → earns milestone reward + unlocks new tactics

---

### 1.5.2 AI Interface Model

**Answer:** Hybrid (Option B + C) - Game-first UI with AI coach available

**Primary experience (NOT chatbot):**
- Game/journey screen
- Current objective
- Current quest
- Recommended next action
- Tasks/missions
- Progress toward 100
- Results
- Milestones
- Analytics
- Rewards/unlocks
- Personalized recommendations

**AI coach available for:**
- "Why are you recommending this?"
- "Help me write this cold email"
- "I tried this and got no responses. What should I change?"
- "Can you give me three different approaches?"
- "I don't understand this task"

**AI works invisibly to:**
- Analyze results
- Determine next best action
- Adapt journey
- Personalize recommendations

**Product positioning:**
> **A growth game powered by an AI coach**
> 
> NOT: A chatbot with game-like decorations

**AI conversation supports the growth loop, not the entire product**

---

### 1.5.3 Core Adaptive Loop (CRITICAL SYSTEM)

**This is one of the most important parts of the product:**

```
UNDERSTAND 
  ↓
CHOOSE NEXT BEST ACTION 
  ↓
QUEST 
  ↓
EXECUTE 
  ↓
RESULT 
  ↓
ANALYZE 
  ↓
LEARN 
  ↓
ADAPT 
  ↓
NEXT QUEST
  ↓
(repeat)
```

**This adaptive loop must be treated as a core system capability throughout planning.**

**Architecture implications:**
- Result tracking and analysis
- Learning/adaptation engine
- Quest recommendation system
- User state/context management
- Historical performance tracking
- Pattern recognition (what's working)
- Dynamic journey adjustment

---

## REMAINING CRITICAL QUESTIONS

### 1.5.3 Automation Scope

When you say "automated system," what should actually be automated?

**Clarify the boundary:**

**Tier 1: Recommendations & Intelligence (Likely YES)**
- Progress tracking
- Next action recommendations
- Milestone detection
- Personalized tactic suggestions
- Result analysis
- Journey adaptation

**Tier 2: Templates & Tools (Likely YES)**
- Email templates (user still sends)
- Cold outreach templates
- Social media copy suggestions
- Landing page copy
- ICP worksheets
- Positioning frameworks

**Tier 3: Semi-automation (UNCLEAR)**
- Lead list building (requires data sources)
- Email sequence drafting (multi-message flows)
- Social media post scheduling (requires integrations)
- Connecting to user's CRM/email
- Analytics dashboard aggregation

**Tier 4: Full automation (PROBABLY NO for initial release)**
- Actually sending outreach emails
- Actually posting to social media
- Actually running ad campaigns
- Autonomous outbound without user approval

**Question:** Which tiers are in scope? Where's the line?

**My hypothesis:**
- Tier 1 & 2: Definitely yes
- Tier 3: Some yes, some no (clarify which)
- Tier 4: No for now (too complex, liability concerns)

---

### 2.1 Existing Prototype Status

**Question revised:**

How much of the current Get100 Customers product already exists, and what should we treat as reference material versus existing functionality?

**Specifically:**
1. Can you describe what's on the Lovable prototype site?
2. Is it just a landing page concept?
3. Are there any implemented features (onboarding, dashboard, etc.)?
4. Should we treat it purely as visual/design reference?
5. Or are there functional elements to preserve?

**If you can't access it or nothing is built yet, that's fine—just confirm.**

---

### 2.2 Core User Loop Detail

Based on your adaptive loop, let me propose a detailed daily/weekly user loop:

**Daily Loop (hypothesis):**
```
User logs in
  ↓
Dashboard shows: current quest, progress, recent results
  ↓
User sees today's recommended action
  ↓
System provides templates/guidance for the action
  ↓
User executes in real world (sends emails, makes calls, runs ads, etc.)
  ↓
User logs result in system (manual input or integration)
  ↓
System analyzes: Did it work? Why/why not?
  ↓
System adapts: Change tactic, continue, try variation, pivot?
  ↓
System updates quest or suggests next action
  ↓
User earns XP/progress for meaningful actions
  ↓
Repeat tomorrow
```

**Is this accurate?**

**Key questions:**
- How often should user engage? (Daily? Few times per week?)
- What if user doesn't log in for a week?
- How does result logging work? (Manual? Integrations? Honor system?)
- When does system "give up" on a tactic and pivot?

---

### 2.3 Feature Completeness

For the complete product, which of these features are in scope?

**Core Journey Features:**
- [ ] Onboarding & company profile setup
- [ ] Customer definition configuration
- [ ] Journey/quest system
- [ ] Dynamic quest recommendation
- [ ] Task/mission system
- [ ] Progress tracking toward 100
- [ ] Result logging and feedback
- [ ] AI coach chat interface
- [ ] Analytics dashboard

**Game Mechanics:**
- [ ] XP system
- [ ] Levels
- [ ] Achievements/badges
- [ ] Milestones
- [ ] Rewards
- [ ] Unlocks (new tactics, content, features)
- [ ] Streaks
- [ ] Leaderboard (compare with other users?)

**Content & Resources:**
- [ ] Tactic library by business model
- [ ] Template library (emails, posts, frameworks)
- [ ] Example gallery (successful outreach, positioning)
- [ ] Growth playbook / knowledge base
- [ ] Video tutorials or guides?

**Integrations:**
- [ ] Email (Gmail, Outlook) - for tracking sent emails?
- [ ] CRM (HubSpot, Pipedrive, etc.) - for customer tracking?
- [ ] Analytics (Google Analytics, Mixpanel) - for web traffic?
- [ ] Payment processors (Stripe) - for revenue tracking?
- [ ] Social media (LinkedIn, Twitter) - for post tracking?
- [ ] Calendar - for scheduling?
- [ ] Zapier/Make - for custom integrations?

**Account & Admin:**
- [ ] User authentication
- [ ] User profile management
- [ ] Account settings
- [ ] Subscription/billing (if paid product)
- [ ] Admin dashboard
- [ ] User management (admin view)
- [ ] Analytics/metrics (admin view)

**Communication:**
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Daily/weekly email digests
- [ ] Reminder system
- [ ] Push notifications (if mobile)
- [ ] SMS notifications?

**Social/Community (optional):**
- [ ] User community
- [ ] Success stories
- [ ] User profiles/sharing
- [ ] Leaderboard
- [ ] Peer support

**Which of these are:**
- ✅ Definitely in scope for complete product
- ⚠️ Maybe/Nice-to-have
- ❌ Explicitly out of scope

---

### 2.4 Business Model

**How does Get100 Customers make money?**

**Options:**
- [ ] Free product (monetize differently)
- [ ] One-time payment
- [ ] Monthly subscription
- [ ] Annual subscription
- [ ] Freemium (free tier + paid upgrades)
- [ ] Free until 100 customers reached, then pay
- [ ] Usage-based (pay per customer acquired)
- [ ] Tiered pricing by features

**If paid, what's the target price point?**

**If freemium, what's free vs paid?**

**Architecture impact:**
- Need payment system?
- Need subscription management?
- Need usage tracking?
- Need billing/invoicing?
- Feature gating?

---

### 2.5 Success Metrics & Expectations

**How do we measure if Get100 is working?**

**Product success metrics:**
- % of users who reach 100 customers?
- Average time to 100 customers?
- User engagement rate (daily/weekly active)?
- Quest completion rate?
- Customer acquisition velocity (customers per week)?

**What's a realistic outcome?**
- Should 80% of active users reach 100 customers?
- Or is 20% success rate acceptable (still better than alternatives)?
- What's expected timeline? (3 months? 6 months? 12 months?)

**When should system "give up" on a user?**
- User hasn't logged in for 30 days?
- User hasn't acquired a customer in 90 days?
- Never give up?

---

---

## FINAL ANSWERS - REMAINING QUESTIONS

### 1.5.3 Automation Scope - ANSWERED

**In Scope:**

**Tier 1 — Intelligence: ✅ YES**
- Progress tracking
- Recommendations
- Analysis
- Strategy adaptation
- Personalized next-best-action selection

**Tier 2 — Templates & Tools: ✅ YES**
- Email templates
- Personalized copy
- Customer interview questions
- Research frameworks
- Sales/outreach scripts
- Offer/positioning help
- Other tools that help user execute current quest

**Core Principle:**
> The product should be more than "AI gives advice." It should actively help the user plan and execute the recommended action through tools, templates, guidance, and analysis.

**Tier 3 — Integrations: ❌ NO (for current scope)**
- No CRM integration
- No Gmail integration
- No LinkedIn integration
- No external analytics platforms
- No external business systems

**Architectural requirement:** Remain extensible for future integrations, but don't require them.

**Tier 4 — Full Automation: ❌ NO**
- System does NOT automatically send emails
- System does NOT publish posts
- System does NOT run campaigns
- System does NOT perform external actions on user's behalf

**User performs all real-world actions themselves.**

---

### 2.1 Existing Prototype Status - ANSWERED

**Status: Nothing is built.**

- Lovable URL was example/reference only
- NOT an existing product or prototype
- Starting from scratch
- No UI, features, database, authentication, or backend exists
- We are designing the complete working Get100 Customers product

---

### 2.2 Core User Loop - ANSWERED

**Confirmed Loop:**
```
User enters product 
  ↓
Sees current objective/quest 
  ↓
Gets guidance/tools/templates 
  ↓
Executes task in real world 
  ↓
Manually logs result 
  ↓
System analyzes result 
  ↓
Adapts strategy 
  ↓
Gives next best quest 
  ↓
Repeat
```

**Timing: Quest-dependent (NOT fixed daily/weekly)**

Examples:
- Quest takes 20 minutes → complete immediately
- Quest requires contacting 20 prospects → may need few days
- Quest requires week-long experiment → return after experiment completes

**System should understand:**
- User is waiting for results
- User is working on something
- Should NOT constantly generate unrelated new tasks
- User returns when quest is complete or enough results available

**Result Logging: Manual + Structured**

NOT a giant text box. System asks relevant questions based on quest type.

**Example: After outreach quest:**
- How many people did you contact?
- How many opened/responded?
- How many showed interest?
- How many became customers?
- What objections did you hear?
- What happened that was unexpected?

**Example: After customer interview:**
- How many people did you interview?
- What problems came up?
- What did they care about?
- What objections did they have?
- Did anyone want to buy?
- What did you learn?

**Result data becomes part of user's long-term growth context.**

**Strategy Adaptation: Intelligent, not rule-based**

AI should NOT change strategy based on arbitrary fixed rules.

**Should analyze results and identify bottleneck:**

- No one responds → investigate targeting, channel, message, offer, contact quality
- People respond but not interested → investigate ICP, problem relevance, positioning, offer
- People interested but don't buy → investigate pricing, trust, sales process, product/offer, objections
- Tactic is producing customers → continue or expand rather than constantly changing

**AI should consider:**
- Results from previous quests
- Conversion rates
- User-reported feedback
- Customer objections
- Business model
- Target customer
- Current stage
- Previous experiments
- What has worked
- What has failed
- What user has already tried

**Goal: Adaptive learning loop, not fixed quest tree**

**CRITICAL ARCHITECTURAL REQUIREMENT:**
Design this as a core product capability. Identify what data we need to collect to make adaptive learning possible.

**Important principle:**
> Do not punish users for reporting bad results. Learning that a strategy doesn't work is useful information and should help the system adapt.

---

### 2.3 Feature Completeness - ANSWERED

**Game Mechanics - In Scope:**

**Core (must have):**
- Main quest: Get 100 Customers
- Stages/chapters
- Quests
- XP
- Levels
- Milestones
- Achievements/badges
- Progress toward 100 customers
- Meaningful unlocks where appropriate

**Potentially later:**
- Streaks
- Challenges
- Boss-style milestone challenges

**Out of scope:**
- ❌ Leaderboards
- ❌ Competitive rankings
- ❌ User-to-user comparison

**Principle:**
> The game should represent the user's own growth journey rather than comparing users against each other.

> XP and rewards should primarily be connected to meaningful actions and progress, not meaningless clicks.

**Integrations - Out of Scope:**

❌ NO external integrations for current product:
- No Gmail
- No LinkedIn
- No CRM systems
- No Social media
- No External analytics platforms
- No Other external business systems

**System should be self-contained.**

**Architectural requirement:** Design so integrations could be added later without making them necessary for core product.

**Communication - In Scope:**

**In-app communication: ✅ YES**
- Quest notifications
- Progress updates
- Recommendations
- Milestones
- Important feedback

**Email: ✅ YES**
- Important reminders
- Quest/result follow-ups
- Milestone notifications
- Re-engagement when appropriate

**Out of scope:**
- ❌ SMS

**Social/Community - Out of Scope:**

❌ Users should NOT interact with each other.

No:
- Community feed
- Social profiles
- User discussions
- Competitions
- Community features

**Principle:**
> Get100 is an individual experience between the user and their AI growth coach.

---

### 2.4 Business Model - ANSWERED

**Subscription product**

Design with subscription business model in mind.

**Architecture should support:**
- Subscription plans
- Payment processing
- Subscription status tracking
- Trial period (if we decide to have one)
- Feature/usage limits (if different plans introduced)
- Subscription cancellation
- Renewal/payment failure handling

**Pricing: TBD**
- Don't lock in specific price during design
- Determine actual pricing and plan structure later

---

### 2.5 Success Metrics - ANSWERED

**Primary User Outcomes:**

Track progression through:
```
0 → 1 → 5 → 10 → 25 → 50 → 100 customers
```

Measure:
- Number of customers acquired
- Percentage of users reaching each milestone
- Time to each milestone
- Customer acquisition rate over time
- Whether user's acquisition rate improves over time

**Important principle:**
> Reaching 100 should be an important long-term outcome, but NOT the only definition of success because different businesses have very different sales cycles and markets.

**Product Behavior Metrics:**

Track:
- Quest completion rate
- Result logging rate
- Percentage of recommended actions actually executed
- Return after completing a quest
- Percentage of quests producing measurable outcomes
- Which tactics produce results
- Which tactics fail
- How often strategies are adapted
- Whether users make progress after strategy changes

**AI Effectiveness Metrics:**

Measure whether AI recommendations are actually useful:
- Did a recommended quest produce a useful result?
- Did user's results improve after an AI strategy change?
- Which types of recommendations lead to customer acquisition?
- Which recommendations consistently fail?

**Goal:** Use this data to improve the AI over time.

**Business/Product Metrics:**

Since Get100 is subscription-based, track:
- Trial-to-paid conversion (if we use a trial)
- Subscription conversion
- Retention
- Churn
- Cancellation reasons
- Monthly recurring revenue (MRR)
- Average revenue per user (ARPU)

---

## TECHNICAL FOUNDATION DECISIONS

### AI Architecture

**Model:** External LLM API (Gemini API initially)

**NOT training our own model.**

**Business-model specialization comes from:**
- System prompts
- Structured growth knowledge
- Tactic library
- User context
- Historical results
- Application logic

**NOT from model training.**

---

## CRITICAL DESIGN DIRECTIVE

**Starting from scratch:**
- Do not assume anything is already implemented
- We are designing the complete product from scratch
- Every feature, screen, flow, database table, API endpoint needs to be designed

---

## NEXT STEPS - PHASE 1 COMPLETION

Ready to proceed to:

1. **Gap Analysis** - Identify contradictions, missing decisions, important areas not yet considered
2. **Phase 1 Summary Document** - Consolidate all discovery findings
3. **Phase 2: Complete Product Definition** - Define the complete product concept formally

**Proceeding with gap analysis now...**
