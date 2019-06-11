create table app_private.user_sessions (
  sid varchar primary key,
  sess jsonb not null,
  expire timestamp(6) not null
);
