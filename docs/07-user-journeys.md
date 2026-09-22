# Phase 5: User Journeys

**Document Version:** 1.0  
**Date:** September 20, 2026  
**Status:** Draft for Review

---

## PURPOSE

This document maps the major end-to-end user journeys through Get100 Customers, showing:
- Entry points
- Actions taken
- System responses
- Decision points
- Alternative paths
- Success states

Each journey is grounded in the product definition from SPEC.md.

---

## JOURNEY MAP NOTATION

```
Entry Point
  ↓
[User Action]
  ↓
{System Response}
  ↓
<Decision Point>
  ├─→ [Alternative Path A]
  └─→ [Alternative Path B]
  ↓
★ Success State
```

---

## JOURNEY 1: FIRST-TIME FOUNDER (Idea Stage → First Customer)

**Entry point:** Lands on Get100 website, clicks "Get Started"

### 1.1 Signup & Onboarding

```
Website Landing Page
  ↓
[Clicks "Get Started" / "Sign Up"]
  ↓
{Signup form: email + password}
  ↓
[Enters email, creates password]
  ↓
{Email verification sent}
  ↓
[Clicks verification link in email]
  ↓
{Account activated, redirected to onboarding}
  ↓
{Shows "Welcome! Let's build your growth plan" — character creation framing}
  ↓
[Onboarding Question 1: "What's your company name?"]
  ↓
[Enters company name: "AI Resume Builder"]
  ↓
{Saves, advances to Q2}
  ↓
[Q2: "What industry are you in?"]
  ↓
{Dropdown: B2B SaaS, B2C SaaS, Services, DTC, Other}
  ↓
[Selects "B2B SaaS"]
  ↓
[Q3: "In one line, what does your product do?"]
  ↓
[Enters: "AI-powered resume builder for job seekers"]
  ↓
[Q4: "Who is your ideal customer?"]
  ↓
[Enters: "Recent college grads looking for their first job"]
  ↓
[Q5: "What stage are you at?"]
  ↓
{Options: Just an idea, MVP built, Launched with no customers, Have some customers}
  ↓
[Selects "Just an idea"]
  ↓
[Q6: "How many customers do you have right now?"]
  ↓
[Enters: 0]
  ↓
[Q7: "What customer acquisition tactics have you tried?"]
  ↓
{Checkboxes: Cold email, Social media, Content, Ads, Partnerships, Communities, None yet}
  ↓
[Selects "None yet"]
  ↓
[Q8: Optional: "Paste your website URL or upload pitch deck"]
  ↓
<Decision: Upload or Skip>
  ├─→ [Skips] → Continue to next step
  └─→ [Uploads deck or URL]
        ↓
        {AI extracts context in background}
        ↓
        {Shows "Analyzing..." progress indicator}
        ↓
        {Pre-fills or enriches profile fields}
        ↓
        Continue to next step
  ↓
{Shows "Your growth coach is preparing your first quests..."}
  ↓
{Background: AI generates initial 3 quests based on profile}
  ↓
{Redirect to dashboard}
  ↓
★ ONBOARDING COMPLETE
```

### 1.2 First Dashboard Experience

```
★ Dashboard loads for first time
  ↓
{Shows welcome message}
  "Welcome, [Name]! Your goal: get your first 100 customers.
   I've created 3 personalized quests to get you started."
  ↓
{Shows progress bar: 0 / 100 customers}
{Shows XP: 0, Level: 1}
{Shows Streak: 0 days}
  ↓
{Shows 3 recommended quests in quest log}
  Quest 1: "Define Your Ideal Customer Profile" (20 XP, 1 hour)
  Quest 2: "Interview 5 Potential Customers" (50 XP, 3-5 days)
  Quest 3: "Build Your First Landing Page" (30 XP, 1 day)
  ↓
{Quest 1 is "primary" (highlighted)}
  ↓
<Decision Point>
  ├─→ [Clicks on Quest 1] → Continue to Quest Detail
  ├─→ [Clicks "Show other options"] → See alternative quests
  ├─→ [Clicks "Not for me"] → Skip with reason, next quest surfaces
  └─→ [Clicks chat bubble] → Chat with AI coach
```

### 1.3 Completing First Quest

```
[Clicks on Quest 1: "Define Your Ideal Customer Profile"]
  ↓
{Quest detail view opens}
  ↓
{Shows:}
  - Quest title and description
  - "Why this quest": Explains relevance to their situation
  - Instructions (step-by-step):
      Step 1: Think about who has the problem you're solving
      Step 2: List demographics (age, role, location)
      Step 3: List psychographics (goals, challenges, motivations)
      Step 4: Write it down using our template
  - Tools provided:
      • ICP Template (personalized for "AI Resume Builder")
      • Example ICP for similar business
  - XP reward: 20 XP
  - Suggested timeframe: Complete in next 1 hour
  ↓
[Clicks "Start Quest"]
  ↓
{Status changes: suggested → active}
{Button changes to "Mark as Done"}
  ↓
[Founder works through steps offline, fills out ICP template]
  ↓
[Returns to app, clicks "Mark as Done"]
  ↓
{Shows result logging form}
  "Great! Let's capture what you learned."
  ↓
{Structured questions for this quest type:}
  Q1: Did you complete your ICP definition? [Yes/No]
  Q2: How confident are you in this ICP? [1-5 scale]
  Q3: Did anything surprise you? [Text field]
  Q4: (Optional) Any other notes? [Text area]
  ↓
[Answers questions:
  Q1: Yes
  Q2: 4/5
  Q3: "Realized my ICP is broader than I thought"
  Q4: "Might need to talk to actual customers to validate"]
  ↓
[Clicks "Submit"]
  ↓
{System processes result}
{Updates growth profile: channels_tried, insights}
{Awards 20 XP}
{Shows celebration animation}
  ↓
{Shows result summary}
  "Quest Complete! +20 XP"
  "Your XP: 20 / 100 (Level 1)"
  ↓
{AI analyzes result, updates growth profile}
{AI recommends next quest}
  ↓
{Shows "What's next" card}
  "Based on your profile and quest result, I recommend:
   Quest 2: Interview 5 Potential Customers
   
   Why: You've defined your ICP, but noted you need to validate it.
   Talking to real people will help you confirm or adjust your assumptions."
  ↓
<Decision Point>
  ├─→ [Accept recommendation] → Quest 2 becomes active
  ├─→ [Show other options] → See 2 alternatives
  └─→ [Not for me] → Skip and get different recommendation
  ↓
★ FIRST QUEST COMPLETED
```

### 1.4 First Customer Acquired

```
[Several quests later, founder has done customer interviews, built landing page, started outreach]
[Current customer count: 0]
  ↓
{Active quest: "Send personalized cold emails to 20 prospects"}
  ↓
[Founder completes quest, sends 20 emails using provided template]
  ↓
[Returns a few days later]
  ↓
[Clicks "Mark as Done" on email quest]
  ↓
{Result logging for outreach quest:}
  Q1: How many people did you contact? [Number: 20]
  Q2: How many responded? [Number: 8]
  Q3: How many showed interest? [Number: 3]
  Q4: Did any become customers? [Yes/No toggle + count]
  ↓
[Answers:
  Q1: 20
  Q2: 8 (40% response rate!)
  Q3: 3
  Q4: YES! Count: 1]
  ↓
{System detects first customer!}
  ↓
{MAJOR CELEBRATION ANIMATION}
  🎉 "Your First Customer! This is huge!" 🎉
  ↓
{Awards quest XP + bonus XP for first customer}
  "Quest Complete: +50 XP"
  "First Customer Milestone: +500 XP"
  "Total XP: 550"
  ↓
{Updates progress bar: 1 / 100}
  ↓
{Updates growth profile:}
  - channels_tried: cold_email → {attempts: 1, successes: 1, conversion_rate: 5%}
  - what_working: "Cold email is working (40% response rate, 1 customer from 20 contacts)"
  - bottleneck_hypothesis: null (too early)
  ↓
{Shows milestone message}
  "You've proven someone will pay you. That's the hardest step.
   Now let's help you get 9 more to hit 10 customers."
  ↓
{AI adapts strategy: since cold email worked, recommend more outreach}
  ↓
{Next quest suggestion:}
  "Follow up with your 3 interested prospects"
  [Or]
  "Send cold emails to 30 more prospects (double down on what's working)"
  ↓
★ FIRST CUSTOMER ACQUIRED
```

### 1.5 Growth Through Quests (1 → 10 → 25 → 50 → 100)

```
[Pattern repeats with variations]
  ↓
{AI continuously adapts based on:}
  - What channels are working
  - What's not working
  - Founder's preferences (skipped quests)
  - Founder's capabilities
  ↓
[Milestone at 10 customers]
  ↓
{Celebration + reflection}
  "You've got 10 customers! Let's analyze what got you here."
  ↓
{Shows insights from growth profile:}
  "Your best channel: cold email (7 customers, 35% response rate)
   Also working: founder communities (3 customers from engagement)
   Not yet working: paid ads (tried once, no conversions)"
  ↓
{Strategy recommendation:}
  "Double down on cold email and communities.
   Let's try paid ads again in a few weeks when you have more social proof."
  ↓
[Similar celebrations at 25, 50, 75 customers]
  ↓
[Approaching 100 customers]
  ↓
{Progress bar: 98 / 100}
  ↓
[Logs 2 more customers]
  ↓
★ 100 CUSTOMERS REACHED
  ↓
{EPIC CELEBRATION}
  ↓
{Shows journey summary:}
  "You did it! 100 customers in [X] months.
   
   Your journey:
   - Quests completed: 47
   - Best channels: Cold email (45 customers), Communities (32), Content (18), Referrals (5)
   - Level reached: 12
   - Total XP: 4,250"
  ↓
{Transition message:}
  "What's next? Let's keep going.
   
   New goal: 250 customers
   Welcome to Growth Mode."
  ↓
{Dashboard updates to Growth Mode}
  - Progress bar: 100 / 250
  - New quest types unlock (scaling, automation, team leverage)
  - Same core loop continues
  ↓
★ TRANSITIONED TO GROWTH MODE
```

---

## JOURNEY 2: FOUNDER WITH EXISTING CUSTOMERS (10 → 100)

**Entry point:** Has product, has 10 customers, looking for growth help

### 2.1 Signup & Onboarding (Experienced Founder)

```
[Similar signup flow as Journey 1]
  ↓
Onboarding Q6: "How many customers do you have right now?"
  ↓
[Enters: 10]
  ↓
Onboarding Q7: "What tactics have you tried?"
  ↓
[Selects: Cold email, Social media, Content]
  ↓
{AI adjusts initial quest recommendations based on:}
  - They're past idea stage
  - They have working channels (need to scale)
  - They're at 10 customers (different strategies than 0)
  ↓
{First quests focus on:}
  - Scaling what's working
  - Optimizing conversion
  - Building systems
  ↓
{NOT focused on:}
  - ICP definition (already validated)
  - First customer tactics (already past that)
  ↓
★ ONBOARDING TAILORED TO STAGE
```

### 2.2 Accelerated Journey

```
Dashboard first load
  ↓
{Progress bar: 10 / 100}
{Level: 1 (new to platform, but experienced founder)}
  ↓
{First quests:}
  Quest 1: "Analyze your best-performing channel" (30 XP)
  Quest 2: "Create an outreach playbook (so you can scale)" (50 XP)
  Quest 3: "Optimize your conversion funnel" (40 XP)
  ↓
[Founder has faster velocity than idea-stage founder]
  ↓
[Can complete quests faster due to existing infrastructure]
  ↓
[Reaches 25 customers within 2-3 weeks]
  ↓
[Reaches 100 customers within 2-3 months]
  ↓
★ FASTER PATH TO 100
```

---

## JOURNEY 3: AI COACH CHAT INTERACTION

**Entry point:** Founder is stuck on a quest or has a question

### 3.1 Getting Help on Current Quest

```
[Founder is on Quest: "Send cold emails to 20 prospects"]
[Stuck: not sure how to write the email]
  ↓
[Clicks chat bubble icon]
  ↓
{Chat interface opens (persistent bubble, not full-screen)}
  ↓
{AI greets with context}
  "Hi! I see you're working on the cold email quest. How can I help?"
  ↓
[Founder types: "I don't know how to write a cold email that doesn't sound spammy"]
  ↓
{AI responds with personalized advice}
  "Great question. For your product (AI Resume Builder) targeting recent college grads, here's what works:
  
  1. Lead with their problem, not your product
  2. Keep it short (3-4 sentences max)
  3. End with a small ask (not 'buy now')
  
  Want me to generate a template specific to your ICP?"
  ↓
[Founder: "Yes please"]
  ↓
{AI generates personalized template}
  "Here's a template for you:
  
  Subject: Struggling with your job search?
  
  Hi [Name],
  
  I noticed you recently graduated from [School]. The job search after college can be brutal—I've been there.
  
  I built an AI tool that helps recent grads write resumes that actually get callbacks. Would you be open to trying it for free?
  
  Best,
  [Your name]
  
  Feel free to adapt this to your style. The key is to show you understand their problem before mentioning your solution."
  ↓
[Founder: "This is perfect, thanks!"]
  ↓
{AI: "You're welcome! When you send those emails, make sure to log the results in the quest so I can help you optimize. Good luck!"}
  ↓
[Founder closes chat, continues with quest]
  ↓
★ SUCCESSFULLY UNBLOCKED VIA CHAT
```

### 3.2 Requesting Quest Swap

```
[Founder has active quest: "Post in 5 online communities about your product"]
[Founder hates self-promotion in communities]
  ↓
[Opens chat]
  ↓
[Founder: "I really don't want to do this community posting quest. Can I do something else?"]
  ↓
{AI responds}
  "I understand—self-promotion in communities can feel uncomfortable.
  
  Let me suggest alternatives that might fit better:
  1. Write a helpful article for your target audience (content marketing)
  2. Do 10 more customer interviews to get referrals
  3. Partner with a complementary product for co-marketing
  
  Which sounds most natural to you?"
  ↓
[Founder: "Customer interviews sound better"]
  ↓
{AI: "Great! I'll swap your quest. Give me a second..."}
  ↓
{System updates:}
  - Marks community quest as "skipped" with reason "not_comfortable"
  - Updates growth profile to deprioritize community quests
  - Generates new quest: "Interview 10 customers and ask for referrals"
  - Adds new quest to active log
  ↓
{AI confirms}
  "Done! I've replaced that quest with 'Interview 10 customers and ask for referrals.'
  
  This also counts as your regular customer interviews, so it's a two-for-one.
  I'll avoid suggesting community posting in the future unless you change your mind."
  ↓
[Founder: "Perfect, thank you"]
  ↓
★ QUEST SWAPPED BASED ON PREFERENCE
```

### 3.3 General Growth Question

```
[Founder not working on any specific quest, just checking in]
  ↓
[Opens chat]
  ↓
[Founder: "I'm at 15 customers now but growth has slowed. What should I focus on?"]
  ↓
{AI analyzes growth profile and responds}
  "Let's look at your data:
  
  Your customer acquisition rate:
  - Weeks 1-4: 2.5 customers/week
  - Weeks 5-8: 1.2 customers/week ← slowdown
  
  Your channels:
  - Cold email: was working great (10 customers), but you haven't done it in 2 weeks
  - Content: inconsistent (5 customers total, but sporadic posting)
  
  Hypothesis: You've shifted focus and stopped doing what was working.
  
  Recommendation: Go back to cold email. Set a goal of 30 emails this week.
  Also, commit to publishing 1 piece of content per week for the next month.
  
  Want me to create quests for these?"
  ↓
[Founder: "Yes, that makes sense"]
  ↓
{AI creates 2 new quests:}
  1. "Send 30 cold emails this week"
  2. "Publish 1 helpful article about job searching"
  ↓
{AI: "Added both to your quest log. Focus on the cold email first since that's been your best channel."}
  ↓
★ STRATEGIC ADVICE PROVIDED, QUESTS GENERATED
```

---

## JOURNEY 4: RE-ENGAGEMENT (Inactive Founder Returns)

**Entry point:** Founder signed up, completed 2 quests, then went inactive for 2 weeks

### 4.1 Re-engagement Email Trigger

```
Day 5 of inactivity (has active quest)
  ↓
{System detects: founder has active quest "Interview 5 customers" but no activity for 5 days}
  ↓
{Sends re-engagement email}
  Subject: "Your quest is still open—need a hand?"
  
  Body:
  "Hi [Name],
  
  You started the quest 'Interview 5 customers' last week but haven't logged results yet.
  
  Is something blocking you? Common challenges:
  - Don't know who to interview?
  - Not sure what to ask?
  - Worried about reaching out?
  
  I can help with any of these. Just reply to this email or hop into the app and chat with me.
  
  Your AI Coach"
  ↓
<Decision Point>
  ├─→ [Ignores email] → Triggers next re-engagement
  └─→ [Clicks link in email] → Taken to dashboard
```

### 4.2 Founder Returns After Re-engagement

```
[Founder clicks email link]
  ↓
{Redirected to dashboard}
  ↓
{Shows welcome back message}
  "Welcome back! You've been away for 2 weeks.
   
   Your active quest: Interview 5 customers
   Current progress: 0 / 100 customers"
  ↓
{Shows chat prompt}
  "Need help getting back on track? I'm here to help."
  ↓
<Decision Point>
  ├─→ [Ignores, goes directly to quest] → Continues quest
  ├─→ [Opens chat] → Gets personalized help
  └─→ [Skips quest, requests new one] → Gets different quest
  ↓
[Founder opens chat]
  ↓
{AI: "Welcome back! What's been blocking you on the customer interview quest?"}
  ↓
[Founder: "I don't know anyone to interview"]
  ↓
{AI provides guidance}
  "That's a common challenge. Here are 3 ways to find people to interview:
  
  1. Post in online communities where your ICP hangs out
  2. Reach out to your personal network (friends, family, former colleagues) and ask for intros
  3. Cold outreach on LinkedIn to people who fit your ICP
  
  Want me to create a mini-quest for each approach so you have a clear path?"
  ↓
[Founder: "Yes, that would help"]
  ↓
{AI creates breakdown:}
  Sub-quest 1: Find 3 relevant online communities
  Sub-quest 2: Make a list of 10 people in your network to ask for intros
  Sub-quest 3: Find 10 LinkedIn profiles that match your ICP
  ↓
{AI: "Start with whichever feels easiest. Once you have a list of potential interviewees, the actual interviews will be much easier."}
  ↓
[Founder feels unblocked, starts working through sub-quests]
  ↓
★ RE-ENGAGED AND UNBLOCKED
```

### 4.3 Long Inactivity (30+ Days)

```
Day 30 of inactivity
  ↓
{System sends final re-engagement email}
  Subject: "Should we pause your journey?"
  
  Body:
  "Hi [Name],
  
  It's been a month since your last login. Life gets busy—I get it.
  
  A few options:
  
  1. Jump back in right now → [Link to dashboard]
  2. Let me know what's blocking you (just reply to this email)
  3. Pause your subscription (no hard feelings—come back when ready)
  
  Your progress is saved. Your 100-customer goal will be here when you're ready.
  
  Your AI Coach"
  ↓
<Decision Point>
  ├─→ [No response after 14 days] → Subscription enters grace period (if active) or remains inactive
  ├─→ [Replies with reason] → Human support or AI provides personalized help
  └─→ [Clicks dashboard link] → Welcome back flow
  ↓
★ FINAL RE-ENGAGEMENT ATTEMPT
```

---

## JOURNEY 5: MILESTONE CELEBRATIONS

**Entry point:** Founder reaches key milestones during their journey

### 5.1 Level Up

```
[Founder completes quest that puts them over XP threshold]
  ↓
{System calculates: XP = 510, Level 2 threshold = 500}
  ↓
{Triggers level-up celebration}
  ↓
{Shows level-up animation}
  🎊 "LEVEL UP!" 🎊
  "You're now Level 2"
  ↓
{Shows stats}
  "Your journey so far:
   - Quests completed: 8
   - Customers acquired: 3
   - Days active: 12
   - Streak: 5 days"
  ↓
{Shows motivational message}
  "You're building momentum. Keep going!"
  ↓
[Founder clicks "Continue"]
  ↓
{Returns to dashboard with updated level display}
  ↓
★ LEVEL UP CELEBRATED
```

### 5.2 Customer Milestones (10, 25, 50, 100)

```
[Founder logs result that brings total to 10 customers]
  ↓
{System detects milestone}
  ↓
{Triggers milestone celebration}
  ↓
{Shows milestone screen}
  🎯 "10 Customers!" 🎯
  
  "You've hit double digits. This is where it starts to feel real.
   
   Let's look at what got you here..."
  ↓
{Shows journey insights from growth profile}
  "Your top channels:
   - Cold email: 6 customers (60%)
   - Communities: 3 customers (30%)
   - Referrals: 1 customer (10%)
   
   Your conversion rates:
   - Email response rate: 35%
   - Response → Customer: 15%
   - Overall: 5.25%
   
   What's working:
   - Your cold email messaging is resonating
   - You're active in the right communities
   
   What to improve:
   - Conversion rate (15%) is low—let's work on closing
   - Get more referrals from your 10 happy customers"
  ↓
{Shows next phase preview}
  "Next milestone: 25 customers
   
   Your strategy shifts now:
   - Less experimenting, more scaling what works
   - Focus on conversion optimization
   - Build repeatable systems
   
   I've updated your quest recommendations to match."
  ↓
[Founder clicks "Let's go"]
  ↓
{Dashboard updates with new milestone goal}
{Progress bar: 10 / 25 (next milestone)}
{AI generates quests appropriate for 10-25 stage}
  ↓
★ MILESTONE CELEBRATED, STRATEGY ADAPTED
```

### 5.3 Streak Milestones

```
[Founder completes quest on 7th consecutive day with activity]
  ↓
{System detects 7-day streak}
  ↓
{Shows streak celebration (lightweight, not as big as level-up)}
  🔥 "7-Day Streak!" 🔥
  "You've completed quests 7 days in a row. Consistency wins."
  ↓
{Awards streak bonus XP: +50 XP}
  ↓
[Founder clicks "Continue"]
  ↓
{Dashboard updates streak counter: 7 days 🔥}
  ↓
★ STREAK CELEBRATED
```

---

## JOURNEY 6: SUBSCRIPTION & PAYMENT

**Entry point:** Various subscription-related events

### 6.1 Trial Ending Soon

```
Day 11 of 14-day trial
  ↓
{System sends email notification}
  Subject: "Your trial ends in 3 days"
  
  Body:
  "Hi [Name],
  
  Your 14-day free trial ends in 3 days.
  
  Your progress so far:
   - Customers acquired: 2
   - Quests completed: 6
   - Level: 2
  
  To keep accessing your AI coach after the trial:
   → Add payment details: [Link]
  
  Plans start at $[X]/month. Cancel anytime.
  
  Questions? Just reply to this email."
  ↓
<Decision Point>
  ├─→ [Adds payment before Day 14] → Trial converts to paid
  ├─→ [No action] → Trial expires on Day 14
  └─→ [Cancels trial] → Account enters canceled state
```

### 6.2 Trial Expiration (No Payment Added)

```
Day 14 of trial, 11:59 PM
  ↓
{No payment method on file}
  ↓
{Trial expires}
  ↓
{Account moves to restricted mode}
  ↓
[Founder tries to log in next day]
  ↓
{Redirected to paywall screen}
  "Your trial has ended
  
   Your progress:
    - 2 customers acquired
    - 6 quests completed
    - Level 2
  
   To continue your journey to 100 customers:
   
   [Add Payment Method]
   
   $[X]/month • Cancel anytime
   
   Your progress is saved. Pick up right where you left off."
  ↓
<Decision Point>
  ├─→ [Adds payment] → Account reactivated, resumes where left off
  ├─→ [Exits] → Receives re-engagement emails over next 7 days
  └─→ [Contacts support] → Human intervention
```

### 6.3 Payment Failure (Active Subscription)

```
Subscription renewal date
  ↓
{Payment processor attempts charge}
  ↓
{Payment fails (insufficient funds, expired card, etc.)}
  ↓
{System logs failure, starts grace period}
  ↓
Day 0: {Sends email immediately}
  Subject: "Payment issue with your Get100 subscription"
  
  "Hi [Name],
  
  We couldn't process your payment for this month.
  
  This happens—no worries. Please update your payment method:
  [Update Payment]
  
  You have 7 days before your account is paused.
  
  Your AI Coach"
  ↓
{In-app banner appears on next login}
  "⚠️ Payment issue — Update your payment method to continue"
  ↓
Day 3: {Retry payment automatically}
  ↓
{If fails again, send second email}
  Subject: "Urgent: Update payment to keep access"
  
  "Your account will be paused in 4 days if we can't process payment."
  ↓
Day 7: {Account moves to restricted mode if still no payment}
  ↓
{Founder logs in}
  ↓
{Shows restricted mode screen}
  "Your account is paused
  
   Your subscription payment failed. To continue:
   
   [Update Payment Method]
   
   Your progress is saved:
    - 15 customers acquired
    - 23 quests completed
    - Level 4
   
   Once you update payment, you'll have immediate access."
  ↓
<Decision Point>
  ├─→ [Updates payment] → Account immediately reactivated
  ├─→ [Cancels subscription] → Account enters canceled state (data retained for 60 days)
  └─→ [No action for 30 days] → Sends final warning before data deletion
  ↓
★ PAYMENT FLOW COMPLETE
```

---

## JOURNEY 7: EDGE CASES

### 7.1 Founder Reaches 100 Customers

```
[Founder logs result that brings total to 100 customers]
  ↓
{System detects goal achieved}
  ↓
{Triggers EPIC celebration}
  ↓
{Full-screen celebration animation}
  🏆 "YOU DID IT!" 🏆
  "100 CUSTOMERS!"
  ↓
{Shows journey summary}
  "Your Journey to 100:
  
   Time: 4 months, 12 days
   Quests completed: 47
   Level reached: 12
   
   Your best channels:
   - Cold email: 45 customers
   - Communities: 32 customers
   - Content marketing: 18 customers
   - Referrals: 5 customers
   
   Key insights:
   - Cold email was your superpower (45%)
   - You mastered community engagement
   - Your conversion rate improved from 2% → 12%
   
   You tried 8 different tactics and found what works for YOU."
  ↓
{Shows "What's Next" screen}
  "Congratulations! But don't stop here.
  
   You've proven you can acquire customers systematically.
   Now let's scale to 250, then 500.
   
   Welcome to Growth Mode.
   
   In Growth Mode, you'll learn:
   - How to scale your best channels
   - Building a sustainable acquisition engine
   - Leveraging your team
   - Advanced tactics for exponential growth
   
   [Enter Growth Mode]"
  ↓
[Founder clicks "Enter Growth Mode"]
  ↓
{Dashboard updates}
{Progress bar changes: 100 / 250}
{Quest types expand: scaling, automation, team leverage}
{Same core loop, higher-level strategies}
  ↓
★ TRANSITIONED TO GROWTH MODE
```

### 7.2 Founder Manually Corrects Customer Count (Churn)

```
[Founder at 25 customers]
  ↓
[Realizes they've lost 3 customers to churn]
  ↓
[Goes to Settings → Customer Count]
  ↓
{Shows current count: 25}
{Shows edit option: "Adjust your count"}
  ↓
[Clicks "Adjust"]
  ↓
{Shows adjustment form}
  "Current count: 25
   New count: [Input field]
   Reason: [Dropdown: Mistake / Lost customers (churn) / Other]
   Notes (optional): [Text area]"
  ↓
[Enters:
   New count: 22
   Reason: Lost customers (churn)
   Notes: "3 customers stopped using the product"]
  ↓
[Clicks "Update"]
  ↓
{System processes}
{Updates customer_events with event_type: "corrected", delta: -3}
{Updates progress bar: 22 / 100}
{Logs in growth profile as flagged event}
{AI will address churn in next quest recommendation}
  ↓
{Shows confirmation}
  "Count updated to 22 customers.
   
   Losing customers is tough, but it's also valuable data.
   Let's figure out why they churned and how to prevent it."
  ↓
{Next quest recommendation prioritizes retention}
  "Quest: Interview your churned customers to understand why they left"
  ↓
★ CHURN LOGGED, STRATEGY ADAPTED
```

### 7.3 Founder Pivots Business

```
[Founder at 15 customers with "AI Resume Builder for recent grads"]
  ↓
[Realizes actual traction is with mid-career professionals, not grads]
  ↓
[Goes to Settings → Edit Profile]
  ↓
{Shows current profile}
  ↓
[Changes:
   Product description: "AI Resume Builder for mid-career professionals"
   ICP: "Professionals with 5-10 years experience looking to level up"]
  ↓
[Clicks "Save Changes"]
  ↓
{System detects significant profile change}
  ↓
{Shows confirmation dialog}
  "It looks like your business has changed significantly.
  
   Your progress (15 customers, Level 4, XP 1200) will be preserved—it represents your overall founder journey.
   
   But I'll update your growth strategy and future quests to match your new direction.
   
   Want to tell me more about what changed?"
  ↓
<Decision Point>
  ├─→ [Clicks "Yes, let's chat"] → Opens chat for context
  └─→ [Clicks "No, just update strategy"] → Logs to strategy_history, adapts quests
  ↓
[Founder chooses "Yes, let's chat"]
  ↓
{Chat opens}
{AI: "Tell me about this pivot. What did you learn from your first 15 customers?"}
  ↓
[Founder explains the pivot]
  ↓
{AI captures insights, updates growth profile}
  ↓
{Logs to strategy_history:}
  "2024-09-20: Pivot from recent grads to mid-career professionals.
   Reason: Actual customers were 5-10 years experience, willing to pay more.
   Learnings: Original ICP was wrong, but validated market exists."
  ↓
{AI generates new quest recommendations based on updated profile}
  ↓
{Shows confirmation}
  "Got it. I've updated your strategy.
   
   Your new quests will focus on mid-career professionals.
   Your progress stays intact—you're still on track to 100 customers.
   
   Let's keep going."
  ↓
★ PIVOT LOGGED, STRATEGY UPDATED, PROGRESS PRESERVED
```

### 7.4 Founder Joins with 100+ Customers

```
Onboarding Q6: "How many customers do you have right now?"
  ↓
[Enters: 150]
  ↓
{System detects >100}
  ↓
{Shows message after onboarding completes}
  "Wow, you already have 150 customers! That's impressive.
   
   You've already reached the initial goal of 100.
   You'll start directly in Growth Mode with a new milestone."
  ↓
{Dashboard loads}
{Progress bar: 150 / 250}
{Quests focus on: scaling, optimization, advanced growth}
  ↓
★ STARTED IN GROWTH MODE
```

---

## JOURNEY DECISION MATRIX

| Starting Point | Onboarding Approach | First Quests Focus | Time to 100 (Typical) |
|----------------|---------------------|-------------------|----------------------|
| **Idea stage, 0 customers** | Full discovery (ICP, validation) | Customer discovery, validation, first customer tactics | 4-6 months |
| **MVP launched, 0 customers** | Skip product questions, focus on go-to-market | ICP validation, channel selection, early outreach | 3-5 months |
| **1-5 customers** | Light validation, focus on scaling | Understand what worked, repeat it, optimize | 3-4 months |
| **10-25 customers** | Skip basics, focus on growth | Scale best channels, conversion optimization | 2-3 months |
| **25-50 customers** | Assume validated, focus on systems | Build repeatable processes, multi-channel | 1-2 months |
| **50-99 customers** | Refinement mode | Accelerate, optimize, hit 100 | 2-4 weeks |
| **100+ customers** | Growth mode from start | Advanced scaling tactics | N/A (already at goal) |

---

## CROSS-JOURNEY PATTERNS

### Pattern 1: The Adaptive Loop (All Journeys)
```
Complete Quest → Log Results → AI Analyzes → Updates Growth Profile → Recommends Next Quest → Repeat
```
This loop is the heartbeat of every journey, regardless of starting point.

### Pattern 2: Milestone Celebrations (All Journeys)
```
Progress → Detect Milestone → Celebrate → Show Insights → Adapt Strategy → Continue
```
Celebrations happen at: 1st customer, 10, 25, 50, 100 customers, plus every 5 levels, plus 7/14/30-day streaks.

### Pattern 3: Re-engagement (When Inactive)
```
Inactivity Detected → Wait 5 days → Send Reminder → Wait 7 more days → Send Help Offer → Wait 14 more days → Final Attempt → Soft Churn
```

### Pattern 4: Strategic Pivot (When Needed)
```
Poor Results or Skip Pattern Detected → AI Surfaces New Approach → Founder Accepts/Rejects → Update Growth Profile → New Quest Direction
```

---

## JOURNEY METRICS TO TRACK

For each journey type, we should measure:

**Completion metrics:**
- % who complete onboarding
- % who complete first quest
- % who acquire first customer
- % who reach 10, 25, 50, 100 customers
- Time to each milestone by starting point

**Engagement metrics:**
- Quest completion rate
- Quest skip rate (with reasons)
- Streak maintenance rate
- Chat usage rate
- Re-engagement success rate

**Business metrics:**
- Trial-to-paid conversion
- Churn rate by journey stage
- Reactivation rate
- Lifetime value by starting point

---

## NEXT STEPS

This completes Phase 5: User Journeys.

**Ready to proceed to Phase 6: User Flows?**

Phase 6 will take these journeys and break them into detailed screen-by-screen flows, defining:
- Every screen/state
- Available actions
- Navigation
- Conditions
- Loading/error/empty states
- Data displayed and submitted

**Or would you prefer to review/modify these journeys first?**

