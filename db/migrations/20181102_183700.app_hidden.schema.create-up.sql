create schema app_hidden;
grant usage on schema app_hidden to :DATABASE_VISITOR;
alter default privileges in schema app_hidden grant usage, select on sequences to :DATABASE_VISITOR;
