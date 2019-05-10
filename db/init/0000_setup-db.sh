cat <<MSG
We're going to drop (if necessary):
- database ${DATABASE_NAME}
- database ${DATABASE_NAME}_test
- database role ${DATABASE_VISITOR}
- database role ${DATABASE_AUTHENTICATOR}
- database role ${DATABASE_OWNER}
@ ${DATBASE_HOST}
MSG

echo "Installing or reinstalling the roles and database..."
# Now we can reset the database
psql -X -v ON_ERROR_STOP=1  --username "$DATABASE_OWNER" template1 <<SQL
-- RESET database
DROP DATABASE IF EXISTS ${DATABASE_NAME};
DROP DATABASE IF EXISTS ${DATABASE_NAME}_test;
DROP ROLE IF EXISTS ${DATABASE_VISITOR};
DROP ROLE IF EXISTS ${DATABASE_AUTHENTICATOR};
DROP ROLE IF EXISTS ${DATABASE_OWNER};
-- Now to set up the database cleanly:
-- Ref: https://devcenter.heroku.com/articles/heroku-postgresql#connection-permissions
-- This is the root role for the database
CREATE ROLE ${DATABASE_OWNER} WITH LOGIN PASSWORD '${DATABASE_OWNER_PASSWORD}'
  -- IMPORTANT: don't grant SUPERUSER in production, we only need this so we can load the watch fixtures!
  SUPERUSER;
-- This is the no-access role that PostGraphile will run as by default
CREATE ROLE ${DATABASE_AUTHENTICATOR} WITH LOGIN PASSWORD '${DATABASE_AUTHENTICATOR_PASSWORD}' NOINHERIT;
-- This is the role that PostGraphile will switch to (from ${DATABASE_AUTHENTICATOR}) during a GraphQL request
CREATE ROLE ${DATABASE_VISITOR};
-- This enables PostGraphile to switch from ${DATABASE_AUTHENTICATOR} to ${DATABASE_VISITOR}
GRANT ${DATABASE_VISITOR} TO ${DATABASE_AUTHENTICATOR};
-- Here's our main database
CREATE DATABASE ${DATABASE_NAME} OWNER ${DATABASE_OWNER};
REVOKE ALL ON DATABASE ${DATABASE_NAME} FROM PUBLIC;
GRANT CONNECT ON DATABASE ${DATABASE_NAME} TO ${DATABASE_OWNER};
GRANT CONNECT ON DATABASE ${DATABASE_NAME} TO ${DATABASE_AUTHENTICATOR};
GRANT ALL ON DATABASE ${DATABASE_NAME} TO ${DATABASE_OWNER};
-- Some extensions require superuser privileges, so we create them before migration time.
\\connect ${DATABASE_NAME}
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
-- This is a copy of the setup above for our test database
CREATE DATABASE ${DATABASE_NAME}_test OWNER ${DATABASE_OWNER};
REVOKE ALL ON DATABASE ${DATABASE_NAME}_test FROM PUBLIC;
GRANT CONNECT ON DATABASE ${DATABASE_NAME}_test TO ${DATABASE_OWNER};
GRANT CONNECT ON DATABASE ${DATABASE_NAME}_test TO ${DATABASE_AUTHENTICATOR};
GRANT ALL ON DATABASE ${DATABASE_NAME}_test TO ${DATABASE_OWNER};
\\connect ${DATABASE_NAME}_test
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL
