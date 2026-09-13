-- My Purrsonal Planner — admin & paid-activation system
-- Run this AFTER 001_init.sql, in Supabase SQL Editor

-- ========== ADMINS ==========
-- Membership in this table is what makes someone an admin.
-- There is deliberately no insert/update/delete policy exposed to
-- clients — add/remove admins by running SQL directly in the
-- Supabase SQL Editor, e.g.:
--   insert into admins (user_id) values ('paste-user-uuid-here');
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table admins enable row level security;

create policy "Self can check own admin status"
  on admins for select using (auth.uid() = user_id);

-- ========== PROFILES: activation gating ==========
alter table profiles add column if not exists account_status text default 'pending_payment'
  check (account_status in ('pending_payment', 'active', 'suspended'));
alter table profiles add column if not exists activated_at timestamptz;
alter table profiles add column if not exists activated_by uuid references auth.users(id);
alter table profiles add column if not exists admin_note text;

-- Admins can see and update every profile (existing policies already
-- let a user see/update their own row; these add admin-wide access
-- on top of that — Postgres OR's multiple permissive policies together)
create policy "Admins can view all profiles"
  on profiles for select
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "Admins can update profiles"
  on profiles for update
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- Guard rail: a regular (non-admin) user can still update their own
-- profile row (name, birthday, height, etc. via the self-update policy),
-- but this trigger silently reverts any attempt to change the
-- activation/admin fields unless the actor is an admin — so the
-- broader self-update policy can't be used to self-activate.
create or replace function protect_privileged_profile_fields()
returns trigger as $$
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    new.account_status := old.account_status;
    new.activated_at := old.activated_at;
    new.activated_by := old.activated_by;
    new.admin_note := old.admin_note;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_protect_privileged on profiles;
create trigger profiles_protect_privileged
  before update on profiles
  for each row execute procedure protect_privileged_profile_fields();

-- ========== ADMIN: activate a user ==========
create or replace function admin_activate_user(p_user_id uuid, p_note text default null)
returns void as $$
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  update profiles
    set account_status = 'active',
        activated_at = now(),
        activated_by = auth.uid(),
        admin_note = coalesce(p_note, admin_note)
    where id = p_user_id;
end;
$$ language plpgsql security definer;

create or replace function admin_suspend_user(p_user_id uuid, p_note text default null)
returns void as $$
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  update profiles
    set account_status = 'suspended',
        admin_note = coalesce(p_note, admin_note)
    where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ========== ADMIN: usage stats (internal Supabase-usage tracking) ==========
-- A row-count proxy per user across the app's data tables — good enough
-- for spotting a heavy user internally; not exact storage bytes.
create or replace function admin_get_usage_stats()
returns table (
  user_id uuid,
  email text,
  name text,
  account_status text,
  created_at timestamptz,
  activated_at timestamptz,
  event_count bigint,
  todo_count bigint
) as $$
begin
  if not exists (select 1 from admins a where a.user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  return query
    select
      p.id::uuid,
      u.email::text,
      p.name::text,
      p.account_status::text,
      p.created_at::timestamptz,
      p.activated_at::timestamptz,
      coalesce(ce.cnt, 0)::bigint,
      coalesce(dt.cnt, 0)::bigint
    from profiles p
    join auth.users u on u.id = p.id
    left join (select ce.user_id, count(*) cnt from calendar_events ce group by ce.user_id) ce on ce.user_id = p.id
    left join (select dt.user_id, count(*) cnt from daily_todos dt group by dt.user_id) dt on dt.user_id = p.id
    order by p.created_at desc;
end;
$$ language plpgsql security definer;
