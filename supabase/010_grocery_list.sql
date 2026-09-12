-- My Purrsonal Planner — Grocery List
-- Run this AFTER 001-009, in Supabase SQL Editor

-- Tracks which items from the preloaded (diet-mode) list a user has
-- checked off. A row exists only when checked; absence = unchecked.
create table if not exists grocery_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diet_category text not null,
  item_text text not null,
  created_at timestamptz default now(),
  unique (user_id, diet_category, item_text)
);

alter table grocery_checks enable row level security;

create policy "Users manage own grocery checks"
  on grocery_checks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User's own custom-added grocery items (separate tab from the preloaded list)
create table if not exists grocery_custom_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_text text not null,
  is_checked boolean not null default false,
  created_at timestamptz default now()
);

alter table grocery_custom_items enable row level security;

create policy "Users manage own custom grocery items"
  on grocery_custom_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_grocery_custom_user
  on grocery_custom_items (user_id, created_at);
