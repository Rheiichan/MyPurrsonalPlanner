-- My Purrsonal Planner — Sleep Tracker
-- Run this AFTER 001-003, in Supabase SQL Editor

create table if not exists sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, -- the date attributed to this sleep (the wake-up morning)
  sleep_time time not null,
  wake_time time not null,
  duration_hours numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, log_date)
);

alter table sleep_logs enable row level security;

create policy "Users manage own sleep logs"
  on sleep_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_sleep_logs_user_date
  on sleep_logs (user_id, log_date desc);

drop trigger if exists sleep_logs_set_updated_at on sleep_logs;
create trigger sleep_logs_set_updated_at
  before update on sleep_logs
  for each row execute procedure public.set_updated_at();
