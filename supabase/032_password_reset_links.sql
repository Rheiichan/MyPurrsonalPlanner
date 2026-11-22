-- Admin-issued password reset links (single use, expire in 24 hours).
create table if not exists password_reset_tokens (
  token       text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
alter table password_reset_tokens enable row level security;
-- No policies: the table is only reachable through the functions below.

-- Admin: create a reset link token for a user.
create or replace function admin_create_reset_token(p_user_id uuid)
returns text as $$
declare
  v_token text;
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User not found';
  end if;
  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  insert into password_reset_tokens (token, user_id, expires_at)
  values (v_token, p_user_id, now() + interval '24 hours');
  return v_token;
end;
$$ language plpgsql security definer set search_path = public, auth, extensions;

-- Public: look up which email a valid token belongs to (so the user can confirm the account).
create or replace function get_reset_token_email(p_token text)
returns text as $$
  select u.email::text
  from password_reset_tokens t
  join auth.users u on u.id = t.user_id
  where t.token = p_token and t.used_at is null and t.expires_at > now();
$$ language sql security definer stable set search_path = public, auth, extensions;

-- Public: set the new password using a valid token (single use).
create or replace function reset_password_with_token(p_token text, p_password text)
returns void as $$
declare
  v_user uuid;
begin
  if p_password is null or length(p_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;
  select user_id into v_user
  from password_reset_tokens
  where token = p_token and used_at is null and expires_at > now()
  for update;
  if v_user is null then
    raise exception 'This reset link is invalid or has expired';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
         updated_at = now()
   where id = v_user;
  update password_reset_tokens set used_at = now() where token = p_token;
  delete from auth.sessions where user_id = v_user;  -- log out old sessions
end;
$$ language plpgsql security definer set search_path = public, auth, extensions;

grant execute on function admin_create_reset_token(uuid) to authenticated;
grant execute on function get_reset_token_email(text) to anon, authenticated;
grant execute on function reset_password_with_token(text, text) to anon, authenticated;
