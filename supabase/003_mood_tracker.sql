-- My Purrsonal Planner — Mood Tracker
-- Run this AFTER 001_init.sql and 002_admin_access.sql, in Supabase SQL Editor

create table if not exists mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  mood_level smallint not null check (mood_level between 1 and 5),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, log_date)
);

alter table mood_logs enable row level security;

create policy "Users manage own mood logs"
  on mood_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_mood_logs_user_date
  on mood_logs (user_id, log_date desc);

drop trigger if exists mood_logs_set_updated_at on mood_logs;
create trigger mood_logs_set_updated_at
  before update on mood_logs
  for each row execute procedure public.set_updated_at();
