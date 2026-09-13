-- My Purrsonal Planner — Budgeting (income-first, PreFundr-style)
-- Run this AFTER 001-013, in Supabase SQL Editor

create table if not exists budget_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  income_type text not null default 'Others' check (income_type in ('Salary', 'Business', 'Allowance', 'Remittance', 'Others')),
  amount numeric not null,
  income_date date not null,
  created_at timestamptz default now()
);

alter table budget_incomes enable row level security;

create policy "Users manage own incomes"
  on budget_incomes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_budget_incomes_user
  on budget_incomes (user_id, income_date desc);

create table if not exists budget_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Others',
  amount numeric not null,
  due_date date not null,
  bank text,
  is_recurring boolean not null default false,
  is_paid boolean not null default false,
  created_at timestamptz default now()
);

alter table budget_expenses enable row level security;

create policy "Users manage own expenses"
  on budget_expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_budget_expenses_user
  on budget_expenses (user_id, due_date desc);

create table if not exists budget_savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  savings_type text not null check (savings_type in ('personal', 'sinking', 'emergency')),
  name text,
  amount numeric not null,
  bank text,
  saved_date date not null default current_date,
  created_at timestamptz default now()
);

alter table budget_savings enable row level security;

create policy "Users manage own savings"
  on budget_savings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_budget_savings_user
  on budget_savings (user_id, saved_date desc);
