# Phase 1: Product Discovery

**Document Version:** 1.0  
**Date:** September 20, 2026  
**Status:** Draft - Awaiting Review

---

## KNOWN FROM MVP

### MVP Access Status
⚠️ **CRITICAL:** The MVP URL (https://get100-landing-page.lovable.app) is currently inaccessible. This limits our ability to verify existing functionality, screens, interactions, and technical implementation details.

**What we can work with:**
- Product description provided
- Product name and core concept
- High-level product vision

### Product Description (Provided)
**Name:** Get100 Customers

**Tagline/Description:**
> "AI growth coach that helps startups acquire their first 100 customers."

**Vision Statement:**
> "Proactive coaching and automated system based on their personal company/idea. Help them just get their first 100 customers. These should all feel like a video game instead of a chatbot."

### Observable Facts from Description
1. **Product type:** AI-powered coaching application
2. **Target metric:** Help users reach exactly 100 customers
3. **User interaction model:** "Video game" experience (not chatbot)
4. **Personalization:** System adapts to user's specific company/idea
5. **Coaching style:** Proactive (not reactive/on-demand)
6. **Automation:** System includes automated components (not just advice)
7. **Platform:** Web-based (deployed on Lovable.app)

---

## INFERRED FROM MVP

### Product Purpose (Inferred)
Help early-stage startup founders overcome the "first customer" problem through guided, gamified, personalized growth strategies.

### Target Users (Inferred)
- **Primary:** Solo founders and small startup teams (pre-seed to seed stage)
- **Stage:** Pre-product-market-fit, struggling with initial customer acquisition
- **Experience level:** First-time founders who lack growth marketing expertise
- **Company stage:** 0-20 customers currently (trying to reach 100)

### Primary User Problem (Inferred)
Startup founders know they need customers but:
- Don't know where to start
- Lack structured growth frameworks
- Get overwhelmed by generic advice
- Need accountability and momentum
- Struggle to stay motivated through rejection
- Don't know which tactics will work for *their* specific business

### Core Value Proposition (Inferred)
A personalized, step-by-step, gamified system that:
- Removes decision paralysis
- Provides context-specific tactics (not generic advice)
- Creates momentum through small wins
- Maintains motivation through game mechanics
- Automates repetitive tasks
- Tracks progress toward the concrete goal of 100 customers

### "Video Game Instead of Chatbot" (Inferred Meaning)
This phrase suggests:

**What it likely INCLUDES:**
- Progress bars, levels, achievements, milestones
- Clear objectives and quests/missions
- Rewards and unlockables
- Visual feedback for actions taken
- Sense of progression and momentum
- Challenge/difficulty curve
- Gamified UI elements (XP, levels, badges)
- Daily/weekly goals
- Streaks and consistency rewards

**What it likely EXCLUDES:**
- Pure text-based Q&A interface
- Passive "ask me anything" interaction model
- Static advice pages
- Generic to-do lists without context
- One-size-fits-all recommendations

### Proactive Coaching (Inferred Meaning)
**System initiates interactions:**
- Sends reminders and nudges
- Suggests next actions based on user state
- Detects when user is stuck
- Celebrates milestones automatically
- Adjusts difficulty based on progress
- Provides timely encouragement

**NOT waiting for user to ask questions**

### Automated System (Inferred Components)
Could include:
- Progress tracking automation
- Email/message templates generation
- Lead list generation
- Social media content suggestions
- Outreach sequence automation
- Analytics aggregation
- Goal tracking
- Performance dashboards

---

## OPEN QUESTIONS

### Critical Questions That Block Architecture Decisions

#### 1. MVP Functionality
Since we cannot access the MVP:
- **What screens/pages currently exist?**
- **What does the onboarding flow look like?**
- **How is user company information collected?**
- **What does the "coaching" interaction look like today?**
- **Are there actual game mechanics implemented, or just the concept?**
- **What data is being collected and stored?**
- **Is there user authentication?**
- **What does the dashboard/main interface look like?**
- **Are there any integrations currently (email, CRM, analytics)?**
- **What technology stack is the MVP built on?**

#### 2. Product Scope & Definition
- **What exactly counts as a "customer"?**
  - Paying customer only?
  - Free trial user?
  - Signed LOI/contract?
  - Active user?
  - Does this vary by business model (SaaS vs services vs product)?

- **What types of startups/businesses are in scope?**
  - B2B SaaS only?
  - B2C products?
  - Service businesses?
  - Marketplaces?
  - Physical products?
  - Local businesses?
  - What about non-tech startups?

- **What stage of business is required to use this?**
  - Just an idea?
  - MVP built?
  - First paying customer already?
  - Product-market fit already found?

- **Geographic scope:**
  - US-only initially?
  - Global?
  - Does advice adapt to different markets?

#### 3. Personalization & AI
- **What AI model/service is being used or planned?**
  - OpenAI GPT-4?
  - Claude?
  - Custom trained model?
  - What's the budget for API costs?

- **What data drives personalization?**
  - Company description?
  - Industry/vertical?
  - Target customer profile?
  - Business model?
  - Current customer count?
  - Previous tactics tried?
  - Budget available?
  - Time commitment available?

- **How does AI generate recommendations?**
  - Prompt engineering?
  - RAG with growth tactic database?
  - Fine-tuned model?
  - Human-curated decision trees with AI augmentation?

#### 4. Gamification Mechanics
- **What specific game mechanics are planned?**
  - XP/leveling system?
  - Achievement badges?
  - Daily quests?
  - Leaderboards?
  - Unlockable content?
  - Currency/points system?
  - Skill trees?
  - Boss battles/major milestones?

- **What actions earn progress/rewards?**
  - Completing coaching tasks?
  - Acquiring customers?
  - Consistent daily activity?
  - Trying new tactics?
  - Updating progress?

- **How is progress tracked?**
  - Manual user input?
  - Integration with CRM/analytics?
  - Email receipt forwarding?
  - Payment processor webhooks?

#### 5. Automation Capabilities
- **What can actually be automated?**
  - Email outreach sequence generation?
  - Social media post scheduling?
  - Lead list building?
  - Analytics dashboard?
  - Follow-up reminders?
  - Content generation?

- **What integrations are needed for automation?**
  - Email (Gmail, Outlook)?
  - CRM (HubSpot, Pipedrive)?
  - Social media (LinkedIn, Twitter)?
  - Analytics (Google Analytics, Mixpanel)?
  - Payment processors (Stripe)?
  - Communication tools (Slack)?

#### 6. Business Model
- **How does Get100 Customers make money?**
  - Free tier + paid upgrades?
  - Free until 100 customers, then pay?
  - One-time payment?
  - Subscription (monthly/annual)?
  - Freemium model?
  - Completely free?

- **What's the pricing strategy?**
  - Target price point?
  - Different tiers?
  - Usage-based pricing?

#### 7. Competition & Differentiation
- **What alternatives exist today?**
  - Generic business coaches?
  - Growth marketing courses?
  - Traction Book methodology?
  - Y Combinator Startup School?
  - Other AI coaching tools?

- **What makes this different/better?**
  - More personalized?
  - More actionable?
  - Better UX?
  - Faster results?
  - Lower cost?

#### 8. Success Metrics
- **How do we measure if this works?**
  - % of users who reach 100 customers?
  - Time to 100 customers?
  - User engagement metrics?
  - Task completion rate?
  - User satisfaction?
  - Revenue per user?

- **What's a realistic success rate?**
  - Should 80% of users reach 100 customers?
  - Or is 20% success rate acceptable?
  - What's the expected timeline (weeks? months?)?

#### 9. Content & Knowledge Base
- **Where does growth advice come from?**
  - Curated database of tactics?
  - AI-generated from first principles?
  - Expert-written playbooks?
  - Community-contributed strategies?
  - Case study database?

- **How is advice kept current?**
  - Manual updates?
  - AI scraping latest growth content?
  - Community feedback loop?

#### 10. MVP vs Full Vision
- **What exists today in the MVP?**
- **What's planned for v1.0 launch?**
- **What's intentionally deferred to v2.0+?**
- **What's the minimum viable feature set to validate the concept?**

---

## ASSUMPTIONS TO VALIDATE

### Product Assumptions
1. **Startups actually want/need this specific tool** (not just generic coaching)
2. **"100 customers" is the right goal** (not 10, not 1000)
3. **Gamification increases completion rates** (vs traditional coaching)
4. **AI can give advice comparable to human growth experts** (for early-stage)
5. **Founders will trust/follow AI recommendations** (not dismiss as generic)
6. **Proactive coaching is better than on-demand** (for this use case)
7. **One-size-fits-most architecture can work** (vs vertical-specific tools)

### User Assumptions
1. **Target users have time to engage with the system** (not too busy building product)
2. **Target users can execute tactics themselves** (don't need agency/done-for-you)
3. **Target users have basic marketing literacy** (understand terms like "cold email," "ICP")
4. **Target users have some budget** (for paid acquisition tactics)
5. **Target users are coachable** (will accept feedback and try new things)

### Technical Assumptions
1. **AI quality is good enough** (with current models)
2. **Integration complexity is manageable** (for small team/solo founder)
3. **Data collection is achievable** (users will track customer acquisition honestly)
4. **Gamification can be built cost-effectively** (not AAA game budget)
5. **Platform can scale** (as users grow)

### Business Model Assumptions
1. **Users will pay for this** (at price point TBD)
2. **CAC < LTV** (can acquire users profitably)
3. **Market is large enough** (enough early-stage startups)
4. **Retention is strong enough** (users don't churn after first week)

---

## BLOCKERS TO PROCEEDING

### Cannot proceed with full discovery until:

1. ✅ **MVP access restored** OR detailed description of existing functionality provided
2. ⚠️ **Product scope questions answered** (what counts as customer, what types of startups)
3. ⚠️ **Gamification specifics defined** (which mechanics, how deep)
4. ⚠️ **Automation scope clarified** (what gets automated vs manual)
5. ⚠️ **Business model confirmed** (free vs paid, pricing)
6. ⚠️ **AI architecture constraints known** (budget, provider, capabilities)
7. ⚠️ **MVP vs v1.0 boundary established** (what exists vs what's planned)

### Can proceed with partial discovery:
- High-level user types and journeys
- General feature categories
- Conceptual architecture
- UX principles

**Recommendation:** Before moving to Phase 2, let's do a Q&A session to answer the critical open questions above, OR you can provide a detailed walkthrough of the MVP if you have access.

---

## NEXT STEPS

**Option A: Answer Open Questions First** (Recommended)
- Review the "Open Questions" section above
- Provide answers to critical questions
- Share MVP screenshots/recordings if available
- Then proceed to Phase 2: Product Definition

**Option B: Proceed with Assumptions**
- Document our assumptions explicitly
- Build product definition based on best guesses
- Flag assumptions that need validation
- Iterate as we learn more

**Option C: Get MVP Access**
- Resolve technical issue with MVP URL
- I'll inspect and document thoroughly
- Then proceed with fuller picture

**Which approach would you like to take?**
