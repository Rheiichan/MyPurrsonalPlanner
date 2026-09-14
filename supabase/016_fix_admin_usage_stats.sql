-- My Purrsonal Planner — fix ambiguous column reference in admin_get_usage_stats
-- Run this in Supabase SQL Editor. Safe to run even if you haven't hit the bug yet.
--
-- Root cause: the function RETURNS TABLE(user_id uuid, ...), which makes
-- "user_id" also the name of one of its own output columns/variables.
-- The bare "where user_id = auth.uid()" guard was ambiguous between that
-- and admins.user_id. Fixed by qualifying it explicitly.

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
