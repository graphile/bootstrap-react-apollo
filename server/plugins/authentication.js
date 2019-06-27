const { makeExtendSchemaPlugin, gql } = require("graphile-utils");

const PassportLoginPlugin = makeExtendSchemaPlugin(build => ({
  typeDefs: gql`
    input RegisterInput {
      username: String!
      email: String!
      password: String!
      name: String
      avatarUrl: String
    }

    type RegisterPayload {
      user: User! @pgField
    }

    input LoginInput {
      username: String!
      password: String!
    }

    type LoginPayload {
      user: User! @pgField
    }

    input VerifyUserEmailInput {
      token: String!
    }

    type VerifyUserEmailPayload {
      userEmail: UserEmail! @pgField
    }

    extend type Mutation {
      register(input: RegisterInput!): RegisterPayload
      login(input: LoginInput!): LoginPayload
      verifyUserEmail(input: VerifyUserEmailInput!): VerifyUserEmailPayload
    }
  `,
  resolvers: {
    Mutation: {
      async register(
        mutation,
        args,
        context,
        resolveInfo,
        { selectGraphQLResultFromTable }
      ) {
        const {
          username,
          password,
          email,
          name = null,
          avatarUrl = null,
        } = args.input;
        const { rootPgPool, login, pgClient } = context;
        try {
          // Call our register function from the database
          const {
            rows: [user],
          } = await rootPgPool.query(
            `select users.* from app_private.really_create_user(
              username => $1,
              email => $2,
              email_is_verified => false,
              name => $3,
              avatar_url => $4,
              password => $5
            ) users where not (users is null)`,
            [username, email, name, avatarUrl, password]
          );

          if (!user) {
            throw new Error("Registration failed");
          }

          const sql = build.pgSql;

          const results = await Promise.all([
            // Fetch the data that was requested from GraphQL, and return it
            selectGraphQLResultFromTable(
              sql.fragment`app_public.users`,
              (tableAlias, sqlBuilder) => {
                sqlBuilder.where(
                  sql.fragment`${tableAlias}.id = ${sql.value(user.id)}`
                );
              }
            ),

            // Tell Passport.js we're logged in
            login(user),

            // Tell pg we're logged in
            pgClient.query("select set_config($1, $2, true);", [
              "jwt.claims.user_id",
              user.id,
            ]),
          ]);

          const [row] = results[0];
          return {
            data: row,
          };
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      async login(
        mutation,
        args,
        context,
        resolveInfo,
        { selectGraphQLResultFromTable }
      ) {
        const { username, password } = args.input;
        const { rootPgPool, login, pgClient } = context;
        try {
          // Call our login function to find out if the username/password combination exists
          const {
            rows: [user],
          } = await rootPgPool.query(
            `select users.* from app_private.login($1, $2) users where not (users is null)`,
            [username, password]
          );

          if (!user) {
            throw new Error("Login failed");
          }

          const sql = build.pgSql;

          const results = await Promise.all([
            // Fetch the data that was requested from GraphQL, and return it
            selectGraphQLResultFromTable(
              sql.fragment`app_public.users`,
              (tableAlias, sqlBuilder) => {
                sqlBuilder.where(
                  sql.fragment`${tableAlias}.id = ${sql.value(user.id)}`
                );
              }
            ),

            // Tell Passport.js we're logged in
            login(user),

            // Tell pg we're logged in
            pgClient.query("select set_config($1, $2, true);", [
              "jwt.claims.user_id",
              user.id,
            ]),
          ]);

          const [row] = results[0];
          return {
            data: row,
          };
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      async verifyUserEmail(
        mutation,
        args,
        context,
        resolveInfo,
        { selectGraphQLResultFromTable }
      ) {
        const { token } = args.input;
        const { rootPgPool } = context;
        const updateResult = await rootPgPool.query(
          `
          UPDATE app_public.user_emails
          SET is_verified = true
          WHERE id = (
            SELECT user_email_id
            FROM app_private.user_email_secrets
            WHERE verification_token = $1
            AND verification_email_sent_at > now() - '7 days'::interval
          )
          RETURNING id
          `,
          [token]
        );
        if (updateResult.rowCount === 0) {
          throw new Error("Invalid token");
        }
        const userEmailId = updateResult.rows[0].id;
        const sql = build.pgSql;
        const [row] = await selectGraphQLResultFromTable(
          sql.fragment`app_public.user_emails`,
          (tableAlias, sqlBuilder) => {
            sqlBuilder.where(
              sql.fragment`${tableAlias}.id = ${sql.value(userEmailId)}`
            );
          }
        );
        return {
          data: row,
        };
      },
    },
  },
}));
module.exports = PassportLoginPlugin;
