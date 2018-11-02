create table app_public.user_emails (
  id serial primary key,
  user_id int not null default app_public.current_user_id() references app_public.users on delete cascade,
  email citext not null check (email ~ '[^@]+@[^@]+\.[^@]+'),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, email)
);
create unique index uniq_user_emails_verified_email on app_public.user_emails(email) where is_verified is true;
alter table app_public.user_emails enable row level security;
create trigger _100_timestamps
  after insert or update on app_public.user_emails
  for each row
  execute procedure app_hidden.tg__timestamps();
create trigger _900_send_verification_email
  after insert on app_public.user_emails
  for each row when (NEW.is_verified is false)
  execute procedure app_private.tg__add_job('user_emails__send_verification');
-- `@omit all` because there's no point exposing `allUserEmails` - you can only
-- see your own, and having this behaviour can lead to bad practices from
-- frontend teams.
comment on table app_public.user_emails is
  E'@omit all\nInformation about a user''s email address.';
comment on column app_public.user_emails.email is
  E'The users email address, in `a@b.c` format.';
comment on column app_public.user_emails.is_verified is
  E'True if the user has is_verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise.';
create policy select_own on app_public.user_emails for select using (user_id = app_public.current_user_id());
create policy insert_own on app_public.user_emails for insert with check (user_id = app_public.current_user_id());
create policy delete_own on app_public.user_emails for delete using (user_id = app_public.current_user_id()); -- TODO check this isn't the last one!
grant select on app_public.user_emails to {{DATABASE_VISITOR}};
grant insert (email) on app_public.user_emails to {{DATABASE_VISITOR}};
grant delete on app_public.user_emails to {{DATABASE_VISITOR}};
