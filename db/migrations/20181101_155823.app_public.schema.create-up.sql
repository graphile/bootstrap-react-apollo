create schema app_public;
grant usage on schema app_public to {{DATABASE_VISITOR}};
alter default privileges in schema app_public grant usage, select on sequences to {{DATABASE_VISITOR}};
