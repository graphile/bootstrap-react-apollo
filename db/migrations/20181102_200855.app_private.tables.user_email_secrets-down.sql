drop trigger _500_insert_secrets on app_public.user_emails;
drop trigger _900_send_verification_email on app_public.user_emails;
drop function app_private.tg_user_email_secrets__insert_with_user_email();
drop function app_private.tg_user_email_secrets__send_verification_email();
drop table app_private.user_email_secrets;
