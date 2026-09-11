-- My Purrsonal Planner — 30-Day Self-Care Challenge
-- Run this AFTER 001-006, in Supabase SQL Editor
-- A row exists only for a day the user has checked off; absence = not done.
-- year_month is stored as 'YYYY-MM' so the challenge naturally resets each month.

create table if not exists selfcare_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year_month text not null,
  day_number smallint not null check (day_number between 1 and 30),
  completed_at timestamptz default now(),
  unique (user_id, year_month, day_number)
);

alter table selfcare_logs enable row level security;

create policy "Users manage own selfcare logs"
  on selfcare_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_selfcare_user_month
  on selfcare_logs (user_id, year_month);
