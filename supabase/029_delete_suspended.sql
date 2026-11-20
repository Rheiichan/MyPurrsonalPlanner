-- Allow admins to delete Suspended accounts too (not only Pending ones).
-- Active and Trial accounts still cannot be deleted from the panel.
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
  if v_status is null or v_status not in ('pending_payment', 'suspended') then
    raise exception 'Only Pending or Suspended accounts can be deleted';
  end if;
  delete from auth.users where id = p_user_id;  -- cascades to profile + all their data
end;
$$ language plpgsql security definer;
