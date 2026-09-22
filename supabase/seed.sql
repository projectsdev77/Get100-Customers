-- Get100-Customers — starter quest template library (SPEC §7.1, PHASES.md Phase 3)
-- Run after schema.sql against the same Supabase project. Safe to re-run —
-- clears and re-seeds quest_templates only (never touches founder data).
--
-- stage_tags: empty array = applies at any stage. industry_tags: empty = generic.
-- result_question_set / tool_templates use {{placeholder}} tokens the Phase 5
-- AI personalization layer will fill in with the founder's actual product/ICP;
-- Phase 3's rule-based engine copies them through as-is (unpersonalized).

delete from quest_templates;

insert into quest_templates
  (category, industry_tags, stage_tags, title_template, instructions_template, default_xp, default_window_days, result_question_set, tool_templates)
values

-- --- cold_email ---
('cold_email', '{}', '{}',
 'Send 10 cold emails to your ICP',
 'Find 10 people who match {{icp}} and send each a short, personal email introducing {{product_name}} and asking for 15 minutes to learn about their workflow.',
 15, 4,
 '[{"id":"sent_count","prompt":"How many emails did you send?","type":"number"},
   {"id":"response_count","prompt":"How many people replied?","type":"number"},
   {"id":"converted","prompt":"Did any of them become a customer?","type":"boolean"}]',
 '[{"label":"Cold email opener","content":"Subject: quick question about {{icp_pain_point}}\n\nHi {{first_name}},\n\nI noticed you work on {{icp_context}} — I''m building {{product_name}} to help with exactly that. Would you be open to a 15-minute call this week?"}]'),

('cold_email', '{}', '{}',
 'Follow up on your last outreach batch',
 'Go back to everyone from your last cold email batch who did not reply. Send one short, no-pressure follow-up.',
 8, 3,
 '[{"id":"followups_sent","prompt":"How many follow-ups did you send?","type":"number"},
   {"id":"response_count","prompt":"How many replied this time?","type":"number"},
   {"id":"converted","prompt":"Did any convert to a customer?","type":"boolean"}]',
 '[{"label":"Follow-up template","content":"Hi {{first_name}} — following up in case this got buried. Still happy to share how {{product_name}} could help with {{icp_pain_point}} if useful. No worries if not!"}]'),

-- --- warm_intros ---
('warm_intros', '{}', '{}',
 'Ask 5 people in your network for an intro',
 'Message 5 people you know who might be connected to {{icp}}. Ask directly for an introduction, and make it easy for them by drafting the intro text yourself.',
 12, 5,
 '[{"id":"asks_sent","prompt":"How many intro requests did you send?","type":"number"},
   {"id":"intros_received","prompt":"How many intros did you actually get?","type":"number"},
   {"id":"converted","prompt":"Did any lead to a customer?","type":"boolean"}]',
 '[{"label":"Intro request","content":"Hey {{contact_name}} — random ask, but do you know anyone who fits {{icp}}? I''m building {{product_name}} and would love an intro if you''re comfortable making one. Happy to send a forwardable blurb."}]'),

-- --- communities ---
('communities', '{}', '{}',
 'Post a helpful answer in 3 relevant communities',
 'Find 3 online communities (Slack, Discord, subreddit, forum) where {{icp}} hangs out. Answer a real question genuinely — no pitching — and mention {{product_name}} only if it truly fits.',
 10, 3,
 '[{"id":"posts_made","prompt":"How many posts/answers did you make?","type":"number"},
   {"id":"replies_or_dms","prompt":"How many replies or DMs did you get?","type":"number"},
   {"id":"converted","prompt":"Did any lead to a customer?","type":"boolean"}]',
 '[]'),

('communities', '{}', '{"idea","prototype"}',
 'Run 5 customer validation interviews in a community',
 'Post in a community asking for 15 minutes of time from anyone who matches {{icp}} to learn about how they currently solve this problem. Do 5 short interviews.',
 15, 5,
 '[{"id":"interviews_done","prompt":"How many interviews did you complete?","type":"number"},
   {"id":"pain_confirmed","prompt":"Did most of them confirm this is a real, painful problem?","type":"boolean"},
   {"id":"converted","prompt":"Did any become an early customer?","type":"boolean"}]',
 '[{"label":"Interview ask","content":"I''m researching how {{icp}} handle {{icp_pain_point}} — would you have 15 min this week to share your experience? Not selling anything, just learning."}]'),

-- --- content ---
('content', '{}', '{}',
 'Publish one piece of content for your ICP',
 'Write and publish one post (LinkedIn, X, blog, or newsletter) that speaks directly to {{icp}} about {{icp_pain_point}}. Mention {{product_name}} naturally if relevant.',
 10, 2,
 '[{"id":"published","prompt":"Did you publish it?","type":"boolean"},
   {"id":"engagement_count","prompt":"How many likes/comments/replies did it get?","type":"number"},
   {"id":"converted","prompt":"Did it lead to a customer conversation?","type":"boolean"}]',
 '[{"label":"Post outline","content":"Hook: a specific, relatable moment of {{icp_pain_point}}\nBody: what you learned building {{product_name}} to solve it\nCTA: a soft ask (reply, DM, or link) — not a hard sell"}]'),

('content', '{}', '{}',
 'Share a build-in-public update',
 'Post a short, honest update about {{product_name}} — a number, a lesson, or a screenshot. Founders who follow along convert better later.',
 6, 2,
 '[{"id":"published","prompt":"Did you publish it?","type":"boolean"},
   {"id":"engagement_count","prompt":"How many likes/comments/replies did it get?","type":"number"}]',
 '[]'),

-- --- paid ---
('paid', '{}', '{"launched"}',
 'Run a small $20-50 test ad',
 'Set up one small paid ad (social or search) targeting {{icp}} with a $20-50 budget. The goal is a signal, not scale.',
 12, 5,
 '[{"id":"spend","prompt":"How much did you spend?","type":"number"},
   {"id":"clicks","prompt":"How many clicks did you get?","type":"number"},
   {"id":"converted","prompt":"Did it lead to a customer?","type":"boolean"}]',
 '[{"label":"Ad copy starter","content":"Headline: {{product_name}} for {{icp}}\nBody: solve {{icp_pain_point}} without the usual hassle.\nCTA: Try it free"}]'),

-- --- partnerships ---
('partnerships', '{}', '{}',
 'Reach out to one potential partner',
 'Identify a business or creator who already reaches {{icp}} and propose a simple win-win (co-content, referral, bundle).',
 12, 5,
 '[{"id":"outreach_sent","prompt":"Did you send the outreach?","type":"boolean"},
   {"id":"response_received","prompt":"Did they respond?","type":"boolean"},
   {"id":"converted","prompt":"Did it lead to any customers?","type":"boolean"}]',
 '[{"label":"Partnership pitch","content":"Hi {{contact_name}} — you reach a lot of {{icp}}, and I think {{product_name}} could genuinely help your audience with {{icp_pain_point}}. Open to a quick chat about a simple partnership?"}]'),

-- --- generic quick-win ---
('communities', '{}', '{}',
 'Ask 3 existing contacts for feedback',
 'Message 3 people who already know you and ask them to try {{product_name}} for 5 minutes and give honest feedback. Feedback often turns into first customers.',
 6, 3,
 '[{"id":"asks_sent","prompt":"How many people did you ask?","type":"number"},
   {"id":"tried_it","prompt":"How many actually tried it?","type":"number"},
   {"id":"converted","prompt":"Did any become a customer?","type":"boolean"}]',
 '[]');
