-- My Purrsonal Planner — Secret Diary (PIN-protected)
-- Run this AFTER 001-005, in Supabase SQL Editor

create extension if not exists pgcrypto;

-- One PIN per user. Only a SHA-256 hash is stored, never the raw PIN.
-- The app hashes the PIN the same way (SHA-256, no salt) before comparing,
-- so this table never needs to reveal the actual digits to anyone,
-- including admins — admins can only RESET it, not read it.
create table if not exists diary_pins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  updated_at timestamptz default now()
);

alter table diary_pins enable row level security;

create policy "Users manage own diary pin"
  on diary_pins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  content text not null,
  created_at timestamptz default now()
);

alter table diary_entries enable row level security;

create policy "Users manage own diary entries"
  on diary_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_diary_entries_user
  on diary_entries (user_id, entry_date desc);

-- Admin-only: reset a user's PIN back to 0000 (hashed) when they forget it.
-- The admin never sees anyone's actual PIN — this only overwrites it.
create or replace function admin_reset_diary_pin(p_user_id uuid)
returns void as $$
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  insert into diary_pins (user_id, pin_hash, updated_at)
  values (p_user_id, encode(digest('0000', 'sha256'), 'hex'), now())
  on conflict (user_id) do update set pin_hash = excluded.pin_hash, updated_at = now();
end;
$$ language plpgsql security definer;
