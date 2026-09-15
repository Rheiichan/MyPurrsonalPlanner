-- My Purrsonal Planner — Push Notifications
-- Run this AFTER 001-020, in Supabase SQL Editor

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_push_subscriptions_user
  on push_subscriptions (user_id);

-- Prevents the same reminder from being sent twice (e.g. if the
-- scheduled function runs more than once in the same window, or a
-- specific calendar event's notify moment gets checked on two ticks).
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null, -- 'quick_todo' | 'mood' | 'agenda' | 'goal'
  ref_key text not null, -- a unique key per occurrence, e.g. 'quick_todo:2026-09-16:06:00' or an event/goal id
  sent_at timestamptz default now(),
  unique (user_id, kind, ref_key)
);

alter table notification_log enable row level security;

create policy "Users view own notification log"
  on notification_log for select
  using (auth.uid() = user_id);
-- No insert/update/delete policy for regular users — only the scheduled
-- Edge Function (using the service role key, which bypasses RLS) writes here.

create index if not exists idx_notification_log_lookup
  on notification_log (user_id, kind, ref_key);
