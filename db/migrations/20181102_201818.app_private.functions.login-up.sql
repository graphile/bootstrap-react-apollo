create function app_private.login(username text, password text) returns app_public.users as $$
declare
  v_user app_public.users;
  v_user_secret app_private.user_secrets;
  v_login_attempt_window_duration interval = interval '6 hours';
begin
  select users.* into v_user
  from app_public.users
  where
    -- Match username against users username, or any verified email address
    (
      users.username = login.username
    or
      exists(
        select 1
        from app_public.user_emails
        where user_id = users.id
        and is_verified is true
        and email = login.username::citext
      )
    );

  if not (v_user is null) then
    -- Load their secrets
    select * into v_user_secret from app_private.user_secrets
    where user_secrets.user_id = v_user.id;

    -- Have there been too many login attempts?
    if (
      v_user_secret.first_failed_password_attempt is not null
    and
      v_user_secret.first_failed_password_attempt > NOW() - v_login_attempt_window_duration
    and
      v_user_secret.password_attempts >= 20
    ) then
      raise exception 'User account locked - too many login attempts' using errcode = 'LOCKD';
    end if;

    -- Not too many login attempts, let's check the password
    if v_user_secret.password_hash = crypt(password, v_user_secret.password_hash) then
      -- Excellent - they're loggged in! Let's reset the attempt tracking
      update app_private.user_secrets
      set password_attempts = 0, first_failed_password_attempt = null
      where user_id = v_user.id;
      return v_user;
    else
      -- Wrong password, bump all the attempt tracking figures
      update app_private.user_secrets
      set
        password_attempts = (case when first_failed_password_attempt is null or first_failed_password_attempt < now() - v_login_attempt_window_duration then 1 else password_attempts + 1 end),
        first_failed_password_attempt = (case when first_failed_password_attempt is null or first_failed_password_attempt < now() - v_login_attempt_window_duration then now() else first_failed_password_attempt end)
      where user_id = v_user.id;
      return null;
    end if;
  else
    -- No user with that email/username was found
    return null;
  end if;
end;
$$ language plpgsql strict security definer volatile set search_path from current;

comment on function app_private.login(username text, password text) is
  E'Returns a user that matches the username/password combo, or null on failure.';
