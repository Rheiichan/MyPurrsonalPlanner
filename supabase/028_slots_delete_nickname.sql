-- My Purrsonal Planner — limited slots, delete unpaid accounts, signup nickname
-- Run in Supabase SQL Editor (after 027).

-- ========== SETTINGS ==========
create table if not exists app_settings (
  key text primary key,
  value text not null
);
alter table app_settings enable row level security;
drop policy if exists "Anyone signed in can read settings" on app_settings;
create policy "Anyone signed in can read settings"
  on app_settings for select using (auth.uid() is not null);
-- To change the limit later:  update app_settings set value = '30' where key = 'max_active_users';
insert into app_settings (key, value) values ('max_active_users', '15')
  on conflict (key) do nothing;

-- ========== SLOTS (visible to every signed-in user on the purchase page) ==========
drop function if exists get_slots_info();
create or replace function get_slots_info()
returns table (max_slots int, taken int, remaining int) as $$
declare
  v_max int;
  v_taken int;
begin
  select coalesce((select s.value::int from app_settings s where s.key = 'max_active_users'), 15) into v_max;
  select count(*)::int into v_taken
    from profiles p
    where p.account_status = 'active'
      and not exists (select 1 from admins a where a.user_id = p.id);
  return query select v_max, v_taken, greatest(v_max - v_taken, 0);
end;
$$ language plpgsql security definer;
grant execute on function get_slots_info() to authenticated;

-- ========== ACTIVATE: refuse when all slots are taken ==========
create or replace function admin_activate_user(p_user_id uuid, p_note text default null)
returns void as $$
declare
  v_max int;
  v_taken int;
  v_already boolean;
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  select (p.account_status = 'active') into v_already from profiles p where p.id = p_user_id;
  if not coalesce(v_already, false) then
    select m.max_slots, m.taken into v_max, v_taken from get_slots_info() m;
    if v_taken >= v_max then
      raise exception 'All % slots are taken. Raise the limit first (app_settings.max_active_users).', v_max;
    end if;
  end if;
  update profiles
    set account_status = 'active',
        activated_at = now(),
        activated_by = auth.uid(),
        admin_note = coalesce(p_note, admin_note)
    where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ========== DELETE an unpaid account (and everything attached to it) ==========
create or replace function admin_delete_unpaid_user(p_user_id uuid)
returns void as $$
declare
  v_status text;
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  if exists (select 1 from admins where user_id = p_user_id) then
    raise exception 'Cannot delete an admin account';
  end if;
  select p.account_status into v_status from profiles p where p.id = p_user_id;
  if v_status is distinct from 'pending_payment' then
    raise exception 'Only unpaid (Pending) accounts can be deleted';
  end if;
  delete from auth.users where id = p_user_id;  -- cascades to profile + all their data
end;
$$ language plpgsql security definer;

-- ========== NICKNAME at signup -> profile name ==========
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data->>'nickname', '')), ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Fill in names for people who already signed up without one, from their email
-- (so the Admin panel stops showing "(no name yet)"). They can still change it.
update profiles p set name = split_part(u.email, '@', 1)
  from auth.users u
  where u.id = p.id and (p.name is null or p.name = '') and p.account_status = 'pending_payment';
