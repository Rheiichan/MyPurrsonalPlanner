-- My Purrsonal Planner — initial schema
-- Run this in Supabase SQL Editor (Project: aockokxdioxijszocakg)

-- ========== PROFILES ==========
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  birthday date,
  height_cm numeric,
  weight_kg numeric,
  diet_mode text default 'maintain', -- 'lose' | 'maintain' | 'gain'
  theme_accent text default 'teal-pink',
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute procedure public.set_updated_at();

-- ========== CALENDAR ==========
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  event_date date not null,
  event_time time, -- nullable = all-day
  event_type text default 'personal', -- personal/work/health/social/reminder/other
  color text default '#4FBDB0',
  created_at timestamptz default now()
);

alter table calendar_events enable row level security;

create policy "Users manage own events"
  on calendar_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_calendar_events_user_date
  on calendar_events (user_id, event_date);

-- Simple to-dos tied to a date (used in the Today/day view)
create table if not exists daily_todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  todo_date date not null,
  content text not null,
  is_done boolean default false,
  created_at timestamptz default now()
);

alter table daily_todos enable row level security;

create policy "Users manage own todos"
  on daily_todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_daily_todos_user_date
  on daily_todos (user_id, todo_date);
