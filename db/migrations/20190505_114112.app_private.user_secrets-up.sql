ALTER TABLE app_private.user_secrets DROP COLUMN IF EXISTS first_failed_password_attempt CASCADE;
ALTER TABLE app_private.user_secrets ADD COLUMN first_failed_password_attempt timestamptz;

ALTER TABLE app_private.user_secrets DROP COLUMN IF EXISTS password_attempts CASCADE;
ALTER TABLE app_private.user_secrets ADD COLUMN password_attempts int4 DEFAULT 0 NOT NULL;
