drop trigger _200_make_first_user_admin on app_public.users;
drop function app_private.tg_users__make_first_user_admin();
drop table app_public.users;
