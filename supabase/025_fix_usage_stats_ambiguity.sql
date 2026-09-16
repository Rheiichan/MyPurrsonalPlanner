-- My Purrsonal Planner — fix ambiguous column reference in admin_get_usage_stats (again)
-- Run this in Supabase SQL Editor.
--
-- Root cause: same issue as the earlier admin_get_usage_stats fix — the
-- function's OUT parameter is itself named "user_id" (from RETURNS TABLE),
-- so every bare, unqualified "user_id" column reference inside the
-- function body is ambiguous against that parameter, even in a query
-- that only touches one table. The new all_rows CTE added in
-- 023_admin_usage_bars.sql had 24 unqualified "select user_id from ..."
-- lines. Fixed by qualifying every one with its table name.

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
      select calendar_events.user_id from calendar_events
      union all select daily_todos.user_id from daily_todos
      union all select mood_logs.user_id from mood_logs
      union all select sleep_logs.user_id from sleep_logs
      union all select goals.user_id from goals
      union all select gratitude_entries.user_id from gratitude_entries
      union all select achievements.user_id from achievements
      union all select diary_entries.user_id from diary_entries
      union all select selfcare_logs.user_id from selfcare_logs
      union all select user_recipes.user_id from user_recipes
      union all select grocery_checks.user_id from grocery_checks
      union all select grocery_custom_items.user_id from grocery_custom_items
      union all select notebooks.user_id from notebooks
      union all select notebook_pages.user_id from notebook_pages
      union all select projects.user_id from projects
      union all select project_items.user_id from project_items
      union all select trips.user_id from trips
      union all select trip_itinerary_items.user_id from trip_itinerary_items
      union all select trip_packing_items.user_id from trip_packing_items
      union all select budget_incomes.user_id from budget_incomes
      union all select budget_expenses.user_id from budget_expenses
      union all select budget_savings.user_id from budget_savings
      union all select budget_allocations.user_id from budget_allocations
      union all select quick_todos.user_id from quick_todos
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
