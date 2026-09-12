-- My Purrsonal Planner — Project Planner
-- Run this AFTER 001-011, in Supabase SQL Editor

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Users manage own projects"
  on projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_projects_user
  on projects (user_id, created_at desc);

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
  before update on projects
  for each row execute procedure public.set_updated_at();

-- One row per checklist item. `section` groups items into the three
-- checklists (Strategy/Ideas, Checklist, Required Materials); capped at
-- 15 per section per project, enforced client-side.
create table if not exists project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null check (section in ('strategy', 'checklist', 'materials')),
  content text not null,
  is_done boolean not null default false,
  position smallint not null,
  created_at timestamptz default now()
);

alter table project_items enable row level security;

create policy "Users manage own project items"
  on project_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_project_items_project
  on project_items (project_id, section, position);
