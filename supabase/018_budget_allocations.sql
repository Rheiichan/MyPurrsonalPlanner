-- My Purrsonal Planner — Budgeting: Allocate tab
-- Run this AFTER 001-017, in Supabase SQL Editor
-- Tracks how much of a specific income was assigned to a specific expense
-- (PreFundr-style pre-budgeting) — one row per income+expense pair.

create table if not exists budget_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  income_id uuid not null references budget_incomes(id) on delete cascade,
  expense_id uuid not null references budget_expenses(id) on delete cascade,
  amount numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (income_id, expense_id)
);

alter table budget_allocations enable row level security;

create policy "Users manage own allocations"
  on budget_allocations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_budget_allocations_income
  on budget_allocations (income_id);
create index if not exists idx_budget_allocations_expense
  on budget_allocations (expense_id);

drop trigger if exists budget_allocations_set_updated_at on budget_allocations;
create trigger budget_allocations_set_updated_at
  before update on budget_allocations
  for each row execute procedure public.set_updated_at();
