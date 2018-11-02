create function app_public.current_user() returns app_public.users as $$
  select users.* from app_public.users where id = app_public.current_user_id();
$$ language sql stable set search_path from current;
comment on function app_public.current_user() is E'The currently logged in user (or null if not logged in).';
