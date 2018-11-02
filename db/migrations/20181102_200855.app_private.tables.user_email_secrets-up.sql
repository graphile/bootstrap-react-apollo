create table app_private.user_email_secrets (
  user_email_id int primary key references app_public.user_emails on delete cascade,
  verification_token text,
  password_reset_email_sent_at timestamptz
);
alter table app_private.user_email_secrets enable row level security;
comment on table app_private.user_email_secrets is
  E'The contents of this table should never be visible to the user. Contains data mostly related to email verification and avoiding spamming users.';
comment on column app_private.user_email_secrets.password_reset_email_sent_at is
  E'We store the time the last password reset was sent to this email to prevent the email getting flooded.';
create function app_private.tg_user_email_secrets__insert_with_user_email() returns trigger as $$
declare
  v_verification_token text;
begin
  if NEW.is_verified is false then
    v_verification_token = encode(gen_random_bytes(4), 'hex');
  end if;
  insert into app_private.user_email_secrets(user_email_id, verification_token) values(NEW.id, v_verification_token);
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;
create trigger _500_insert_secrets
  after insert on app_public.user_emails
  for each row
  execute procedure app_private.tg_user_email_secrets__insert_with_user_email();
comment on function app_private.tg_user_email_secrets__insert_with_user_email() is
  E'Ensures that every user_email record has an associated user_email_secret record.';
