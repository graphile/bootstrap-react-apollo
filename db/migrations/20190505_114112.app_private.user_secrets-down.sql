ALTER TABLE app_private.user_secrets DROP COLUMN IF EXISTS first_failed_password_attempt CASCADE;
ALTER TABLE app_private.user_secrets DROP COLUMN IF EXISTS password_attempts CASCADE;
