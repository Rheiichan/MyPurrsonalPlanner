-- My Purrsonal Planner — fix type-mismatch in admin_get_usage_stats
-- Run this in Supabase SQL Editor.
--
-- Root cause: RETURN QUERY requires the selected columns' types to match
-- the declared RETURNS TABLE types exactly. coalesce(bigint, 0) can
-- resolve to integer instead of bigint (the literal 0 is int4), and
-- auth.users.email is varchar rather than text — both close enough to
-- look right but not exact matches. Fixed by casting every column
-- explicitly to its declared type.

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
