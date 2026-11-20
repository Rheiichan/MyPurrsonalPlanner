-- My Purrsonal Planner — Fitness Tracker: daily calorie log + weight log
-- Run in Supabase SQL Editor (after 030/029).

create table if not exists food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  meal text not null default 'snack' check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  calories integer not null check (calories >= 0 and calories <= 10000),
  sodium_mg integer check (sodium_mg >= 0),   -- optional
  sugar_g numeric check (sugar_g >= 0),       -- optional
  created_at timestamptz default now()
);
create index if not exists food_logs_user_date on food_logs (user_id, log_date);
alter table food_logs enable row level security;
drop policy if exists "Users manage own food logs" on food_logs;
create policy "Users manage own food logs"
  on food_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  weight_kg numeric not null check (weight_kg > 20 and weight_kg < 400),
  created_at timestamptz default now(),
  unique (user_id, log_date)
);
alter table weight_logs enable row level security;
drop policy if exists "Users manage own weight logs" on weight_logs;
create policy "Users manage own weight logs"
  on weight_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weight the person started from, so the progress bar has a fixed starting point.
alter table profiles add column if not exists start_weight_kg numeric;
