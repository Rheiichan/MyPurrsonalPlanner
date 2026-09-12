-- My Purrsonal Planner — Notebooks (5 customizable notebooks, up to 25 pages each)
-- Run this AFTER 001-010, in Supabase SQL Editor

create table if not exists notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot smallint not null check (slot between 1 and 5),
  name text not null default 'Notebook',
  color text not null default '#4FBDB0',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, slot)
);

alter table notebooks enable row level security;

create policy "Users manage own notebooks"
  on notebooks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists notebooks_set_updated_at on notebooks;
create trigger notebooks_set_updated_at
  before update on notebooks
  for each row execute procedure public.set_updated_at();

create table if not exists notebook_pages (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references notebooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Page',
  content text default '',
  position smallint not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table notebook_pages enable row level security;

create policy "Users manage own notebook pages"
  on notebook_pages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_notebook_pages_notebook
  on notebook_pages (notebook_id, position);

drop trigger if exists notebook_pages_set_updated_at on notebook_pages;
create trigger notebook_pages_set_updated_at
  before update on notebook_pages
  for each row execute procedure public.set_updated_at();
