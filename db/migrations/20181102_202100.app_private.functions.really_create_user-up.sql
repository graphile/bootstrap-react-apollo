create function app_private.really_create_user(
  username text,
  email text,
  email_is_verified bool,
  name text,
  avatar_url text,
  password text default null
) returns app_public.users as $$
declare
  v_user app_public.users;
  v_username text = username;
  v_avatar_url text = avatar_url;
begin
  -- Sanitise username...
  if v_username is null or length(v_username) = 0 then
    v_username = coalesce(name, 'user');
  end if;
  v_username = regexp_replace(v_username, '^[^a-z]+', '', 'i');
  v_username = regexp_replace(v_username, '[^a-z0-9]+', '_', 'i');
  if v_username is null or length(v_username) < 3 then
    v_username = 'user';
  end if;
  -- ...and make username unique if necessary
  select (
    case
    when i = 0 then v_username
    else v_username || i::text
    end
  ) into v_username from generate_series(0, 1000) i
  where not exists(
    select 1
    from app_public.users
    where users.username = (
      case
      when i = 0 then v_username
      else v_username || i::text
      end
    )
  )
  limit 1;


  -- If avatar_url is an empty string, just set it to null
  -- Helps to keep edge cases clean later on
  if length(v_avatar_url) = 0 then
    v_avatar_url = null;
  end if;

  -- Insert the new user
  insert into app_public.users (username, name, avatar_url) values
    (v_username, name, v_avatar_url)
    returning * into v_user;

	-- Add the user's email
  if email is not null then
    insert into app_public.user_emails (user_id, email, is_verified)
    values (v_user.id, email, email_is_verified);
  end if;

  -- Store the password
  if password is not null then
    update app_private.user_secrets
    set password_hash = crypt(password, gen_salt('bf'))
    where user_id = v_user.id;
  end if;

  return v_user;
end;
$$ language plpgsql volatile set search_path from current;

comment on function app_private.really_create_user(username text, email text, email_is_verified bool, name text, avatar_url text, password text) is
  E'Creates a user account. All arguments are optional, it trusts the calling method to perform sanitisation.';
