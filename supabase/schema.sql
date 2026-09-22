-- Get100-Customers — database schema
-- Matches the data model in SPEC.md §19.
-- Run this once against a Supabase project (SQL editor, or `supabase db push`).
-- RLS policies below are a starting point (founders can only touch their own
-- rows); tighten/extend per-table before real launch (SPEC.md §13 privacy,
-- PHASES.md Phase 11 hardening).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- founders — one row per signed-up founder, keyed to Supabase auth.users
-- ---------------------------------------------------------------------------
create table if not exists founders (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  name text,
  company_name text,
  industry text,
  product_description text,
  icp text,
  stage text check (stage in ('idea', 'prototype', 'launched')),
  channels_tried text[] default '{}',
  current_customer_count integer not null default 0,
  level integer not null default 1,
  xp integer not null default 0,
  streak_count integer not null default 0,
  last_streak_activity_at timestamptz,
  email_notification_prefs jsonb not null default
    '{"new_quest":true,"window_approaching":true,"re_engagement":true,"milestone":true,"weekly_recap":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- founder_documents — optional onboarding url/doc uploads (SPEC §5)
-- ---------------------------------------------------------------------------
create table if not exists founder_documents (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references founders (id) on delete cascade,
  type text not null check (type in ('url', 'upload')),
  source text not null,
  extracted_summary text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- growth_profiles — the AI's evolving "what we've learned" state (SPEC §9)
-- ---------------------------------------------------------------------------
create table if not exists growth_profiles (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null unique references founders (id) on delete cascade,
  channels_tried jsonb not null default '{}'::jsonb,
  what_working jsonb not null default '[]'::jsonb,
  what_not_working jsonb not null default '[]'::jsonb,
  bottleneck_hypothesis text,
  strategy_history jsonb not null default '[]'::jsonb,
  last_updated timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- quest_templates — hand-written starter library (SPEC §7.1); seeded content,
-- no founder_id — shared across all founders, filtered/adapted per founder.
-- ---------------------------------------------------------------------------
create table if not exists quest_templates (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  industry_tags text[] default '{}',
  stage_tags text[] default '{}',
  title_template text not null,
  instructions_template text not null,
  default_xp integer not null default 10,
  default_window_days integer not null default 3,
  result_question_set jsonb not null default '[]'::jsonb,
  tool_templates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- quests — a founder's actual quest log (SPEC §7.2, §7.3)
-- ---------------------------------------------------------------------------
create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references founders (id) on delete cascade,
  template_id uuid references quest_templates (id) on delete set null,
  title text not null,
  description text,
  instructions text,
  category text,
  xp_value integer not null default 10,
  tools_provided jsonb not null default '[]'::jsonb,
  result_questions jsonb not null default '[]'::jsonb,
  success_criteria text,
  sub_tasks jsonb not null default '[]'::jsonb,
  suggested_window text,
  expires_at timestamptz,
  status text not null default 'suggested'
    check (status in ('suggested', 'active', 'in_progress', 'awaiting_report', 'completed', 'skipped', 'expired')),
  skip_reason text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  completed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- quest_results — structured + free-text outcomes (SPEC §8)
-- ---------------------------------------------------------------------------
create table if not exists quest_results (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references quests (id) on delete cascade,
  founder_id uuid not null references founders (id) on delete cascade,
  structured_answers jsonb not null default '{}'::jsonb,
  notes text,
  ai_summary text,
  reported_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- customer_events — manual self-report / correction log (SPEC §8, §14)
-- ---------------------------------------------------------------------------
create table if not exists customer_events (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references founders (id) on delete cascade,
  quest_id uuid references quests (id) on delete set null,
  event_type text not null check (event_type in ('reported', 'corrected')),
  delta integer not null,
  reported_at timestamptz not null default now(),
  note text
);

-- ---------------------------------------------------------------------------
-- subscriptions — trial/plan/status (SPEC §3)
-- ---------------------------------------------------------------------------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null unique references founders (id) on delete cascade,
  plan text not null default 'standard',
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'restricted', 'canceled')),
  trial_ends_at timestamptz,
  billing_provider text default 'stripe',
  billing_provider_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- notifications_log — sent notifications (SPEC §11)
-- ---------------------------------------------------------------------------
create table if not exists notifications_log (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references founders (id) on delete cascade,
  type text not null,
  channel text not null check (channel in ('in_app', 'email')),
  message text not null default '',
  read_at timestamptz,
  sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- admin_users — internal admin dashboard access (SPEC §12)
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  role text not null default 'support',
  created_at timestamptz not null default now()
);

-- Without RLS, any authenticated user could read this table over the REST
-- API and enumerate admin auth_user_ids. Self-select only, so the app can
-- ask "am I an admin"; rows are otherwise managed via the service-role
-- client or the Supabase dashboard, never by clients directly.
alter table admin_users enable row level security;

create policy "admin_users_self_select" on admin_users
  for select using (auth.uid() = auth_user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — founders can only read/write their own data.
-- quest_templates is readable by any authenticated user (shared library),
-- writable only via service role (seeding/admin). Tighten further per-table
-- before launch (PHASES.md Phase 11).
-- ---------------------------------------------------------------------------
alter table founders enable row level security;
alter table founder_documents enable row level security;
alter table growth_profiles enable row level security;
alter table quests enable row level security;
alter table quest_results enable row level security;
alter table customer_events enable row level security;
alter table subscriptions enable row level security;
alter table notifications_log enable row level security;
alter table quest_templates enable row level security;

create policy "founders_select_own" on founders
  for select using (auth.uid() = auth_user_id);
create policy "founders_update_own" on founders
  for update using (auth.uid() = auth_user_id);
create policy "founders_insert_own" on founders
  for insert with check (auth.uid() = auth_user_id);

create policy "founder_documents_owner" on founder_documents
  for all using (founder_id in (select id from founders where auth_user_id = auth.uid()));

create policy "growth_profiles_owner" on growth_profiles
  for select using (founder_id in (select id from founders where auth_user_id = auth.uid()));

create policy "quests_owner" on quests
  for all using (founder_id in (select id from founders where auth_user_id = auth.uid()));

create policy "quest_results_owner" on quest_results
  for all using (founder_id in (select id from founders where auth_user_id = auth.uid()));

create policy "customer_events_owner" on customer_events
  for all using (founder_id in (select id from founders where auth_user_id = auth.uid()));

create policy "subscriptions_owner" on subscriptions
  for select using (founder_id in (select id from founders where auth_user_id = auth.uid()));

-- Reads and marking-as-read go through the founder's own RLS-scoped
-- session; creation always goes through the service-role admin client
-- instead (system-generated content — see src/lib/notifications/notify.ts),
-- so no insert policy is needed here.
create policy "notifications_log_owner_select" on notifications_log
  for select using (founder_id in (select id from founders where auth_user_id = auth.uid()));

create policy "notifications_log_owner_update" on notifications_log
  for update using (founder_id in (select id from founders where auth_user_id = auth.uid()));

create policy "quest_templates_read_all" on quest_templates
  for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Auto-provision a founders row the instant someone signs up (Phase 1), so
-- every later feature can assume founder_id already exists as a foreign key
-- target. security definer runs as the table owner, bypassing RLS, since
-- auth.users inserts happen outside any founder's own session.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_founder()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.founders (auth_user_id)
  values (new.id)
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_founder();

-- ---------------------------------------------------------------------------
-- Storage bucket for onboarding doc uploads (SPEC §5, PHASES.md Phase 2).
-- Files are stored under `<auth_user_id>/<filename>` so the RLS policy below
-- can scope access by path prefix. Private bucket — no public URLs.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('founder-documents', 'founder-documents', false)
on conflict (id) do nothing;

create policy "founder_documents_storage_owner_select" on storage.objects
  for select using (
    bucket_id = 'founder-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "founder_documents_storage_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'founder-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
