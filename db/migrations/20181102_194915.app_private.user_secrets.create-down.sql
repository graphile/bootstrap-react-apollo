drop trigger _500_insert_secrets on app_public.users;
drop function app_private.tg_user_secrets__insert_with_user();
drop table app_private.user_secrets;
