-- My Purrsonal Planner — Quick To-Do (Hub widget)
-- Run this AFTER 001-014, in Supabase SQL Editor
-- Separate from daily_todos (used in Calendar, which persists with a
-- strikethrough when checked) — this list is meant for fast capture,
-- and checking an item off here deletes it immediately instead.

create table if not exists quick_todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  position integer not null default 0,
  created_at timestamptz default now()
);

alter table quick_todos enable row level security;

create policy "Users manage own quick todos"
  on quick_todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_quick_todos_user
  on quick_todos (user_id, position);
