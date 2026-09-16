-- My Purrsonal Planner — Admin usage progress bars
-- Run this AFTER 001-022, in Supabase SQL Editor
--
-- Two things, both admin-only:
--   1. admin_get_db_size_bytes() — the real total database size, to compare
--      against Supabase's free-tier 500 MB limit.
--   2. admin_get_usage_stats() — now also returns total_rows, a row count
--      across every table in the app for that user (not just calendar/
--      to-dos as before). This is a rough stand-in for "how much space
--      this user is using" — rows vary a lot in actual size (a diary
--      entry is much bigger than a mood log), so treat it as a relative
--      signal for spotting a heavy user, not an exact byte count.

create or replace function admin_get_db_size_bytes()
returns bigint as $$
begin
  if not exists (select 1 from admins a where a.user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  return pg_database_size(current_database());
end;
$$ language plpgsql security definer;

drop function if exists admin_get_usage_stats();

create function admin_get_usage_stats()
returns table (
  user_id uuid,
  email text,
  name text,
  account_status text,
  created_at timestamptz,
  activated_at timestamptz,
  trial_ends_at timestamptz,
  event_count bigint,
  todo_count bigint,
  total_rows bigint
) as $$
begin
  if not exists (select 1 from admins a where a.user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  return query
    with all_rows as (
      select user_id from calendar_events
      union all select user_id from daily_todos
      union all select user_id from mood_logs
      union all select user_id from sleep_logs
      union all select user_id from goals
      union all select user_id from gratitude_entries
      union all select user_id from achievements
      union all select user_id from diary_entries
      union all select user_id from selfcare_logs
      union all select user_id from user_recipes
      union all select user_id from grocery_checks
      union all select user_id from grocery_custom_items
      union all select user_id from notebooks
      union all select user_id from notebook_pages
      union all select user_id from projects
      union all select user_id from project_items
      union all select user_id from trips
      union all select user_id from trip_itinerary_items
      union all select user_id from trip_packing_items
      union all select user_id from budget_incomes
      union all select user_id from budget_expenses
      union all select user_id from budget_savings
      union all select user_id from budget_allocations
      union all select user_id from quick_todos
    ),
    totals as (
      select ar.user_id, count(*) cnt from all_rows ar group by ar.user_id
    )
    select
      p.id::uuid,
      u.email::text,
      p.name::text,
      p.account_status::text,
      p.created_at::timestamptz,
      p.activated_at::timestamptz,
      p.trial_ends_at::timestamptz,
      coalesce(ce.cnt, 0)::bigint,
      coalesce(dt.cnt, 0)::bigint,
      coalesce(t.cnt, 0)::bigint
    from profiles p
    join auth.users u on u.id = p.id
    left join (select ce.user_id, count(*) cnt from calendar_events ce group by ce.user_id) ce on ce.user_id = p.id
    left join (select dt.user_id, count(*) cnt from daily_todos dt group by dt.user_id) dt on dt.user_id = p.id
    left join totals t on t.user_id = p.id
    order by p.created_at desc;
end;
$$ language plpgsql security definer;
