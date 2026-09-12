-- My Purrsonal Planner — Recipes (user-created/saved recipes)
-- Run this AFTER 001-007, in Supabase SQL Editor
-- Default/library recipes (Keto, Pescatarian, Clean Eating, etc.) ship as
-- static app data, not a database table, so there's nothing to migrate for those.

create table if not exists user_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  yield_text text,
  ingredients text not null,
  procedure text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_recipes enable row level security;

create policy "Users manage own recipes"
  on user_recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_recipes_user
  on user_recipes (user_id, created_at desc);

drop trigger if exists user_recipes_set_updated_at on user_recipes;
create trigger user_recipes_set_updated_at
  before update on user_recipes
  for each row execute procedure public.set_updated_at();
