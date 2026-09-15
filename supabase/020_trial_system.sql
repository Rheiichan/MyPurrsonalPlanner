-- My Purrsonal Planner — 30-day trial system
-- Run this AFTER 001-019, in Supabase SQL Editor
--
-- New signups now get full access immediately for 30 days (a "trial"),
-- instead of being blocked until an admin activates them. After 30 days,
-- if nobody has upgraded them to "active", the app locks everything
-- except Calendar, Quick To-Do, Hub, and My Profile — enforced entirely
-- client-side by comparing trial_ends_at to the current time, so no
-- cron job or server-side job is needed to "expire" anyone.
--
-- Admins can still activate (permanent, bypasses trial) or suspend any
-- account exactly as before — that part is unchanged.

alter table profiles add column if not exists trial_started_at timestamptz default now();
alter table profiles add column if not exists trial_ends_at timestamptz default (now() + interval '30 days');

-- Allow 'trial' as a valid status, and make it the default for new rows
-- going forward (existing rows keep whatever status they already have —
-- this does not change anyone's current account_status).
alter table profiles drop constraint if exists profiles_account_status_check;
alter table profiles add constraint profiles_account_status_check
  check (account_status in ('pending_payment', 'trial', 'active', 'suspended'));
alter table profiles alter column account_status set default 'trial';

-- Surface trial_ends_at in the admin usage-stats view so the Admin panel
-- can show how much trial time each user has left.
create or replace function admin_get_usage_stats()
returns table (
  user_id uuid,
  email text,
  name text,
  account_status text,
  created_at timestamptz,
  activated_at timestamptz,
  trial_ends_at timestamptz,
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
      p.trial_ends_at::timestamptz,
      coalesce(ce.cnt, 0)::bigint,
      coalesce(dt.cnt, 0)::bigint
    from profiles p
    join auth.users u on u.id = p.id
    left join (select ce.user_id, count(*) cnt from calendar_events ce group by ce.user_id) ce on ce.user_id = p.id
    left join (select dt.user_id, count(*) cnt from daily_todos dt group by dt.user_id) dt on dt.user_id = p.id
    order by p.created_at desc;
end;
$$ language plpgsql security definer;
