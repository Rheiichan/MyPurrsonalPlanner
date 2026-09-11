-- My Purrsonal Planner — Goals + Gratitude Journal + Achievements
-- Run this AFTER 001-004, in Supabase SQL Editor
-- (These power the "How Are You Feeling?" flow's Goals and Gratitude Journal links.)

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_date date,
  is_done boolean default false,
  created_at timestamptz default now()
);
alter table goals enable row level security;
create policy "Users manage own goals"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index if not exists idx_goals_user on goals (user_id, created_at desc);

create table if not exists gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  content text not null,
  created_at timestamptz default now()
);
alter table gratitude_entries enable row level security;
create policy "Users manage own gratitude entries"
  on gratitude_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index if not exists idx_gratitude_user on gratitude_entries (user_id, entry_date desc);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  achieved_date date,
  note text,
  created_at timestamptz default now()
);
alter table achievements enable row level security;
create policy "Users manage own achievements"
  on achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index if not exists idx_achievements_user on achievements (user_id, created_at desc);
