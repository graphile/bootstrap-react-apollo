const { postgraphile, makePluginHook } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const chalk = require("chalk");
const { getUserClaimsFromRequest } = require("./installPassport");

/* Load optional plugins */
/* eslint-disable global-require, import/no-dynamic-require, import/no-unresolved, no-console */
let PostGraphileSupporter;
let enhanceHttpServerWithSubscriptions;
let PostGraphilePro;
try {
  ({
    default: PostGraphileSupporter,
    enhanceHttpServerWithSubscriptions,
  } = require("@graphile/supporter"));
  console.log("Supporter plugin loaded - thanks! ❤️");
} catch (e) {
  // Failed to load supporter plugin
  if (process.env.GRAPHILE_LICENSE) {
    // You have a GRAPHILE_LICENSE, but the plugin failed to load. You might
    // want to know about this (maybe the key is corrupt, or expires?). If you
    // don't; delete this!
    throw e;
  }
  console.log();
  console.log(
    `Please support PostGraphile development:\n\n  ${chalk.blue.bold.underline(
      "https://graphile.org/donate"
    )} 🙏`
  );
  console.log();
}
try {
  ({ default: PostGraphilePro } = require("@graphile/pro"));
  /*
   * The Pro plugin installs a number of protections to your GraphQL API.
   *
   * Here's a quick-reference for common tasks; full documentation is here:
   *
   *   https://www.graphile.org/postgraphile/production/
   *
   * To disable pagination cap (first / last):
   *   On an individual table:
   *     SQL: comment on table app_public.users is E'@paginationCap 20';
   *   Globally:
   *     Envvar: GRAPHQL_PAGINATION_CAP=-1
   *
   * To extend the depth limit:
   *   Envvar: GRAPHQL_DEPTH_LIMIT=20
   *
   * To double the default the cost limit:
   *   Envvar: GRAPHQL_COST_LIMIT=60000
   *
   */
} catch (e) {
  // Pro plugin not loaded
  if (process.env.GRAPHILE_LICENSE) {
    // You have a GRAPHILE_LICENSE, but the plugin failed to load. You might
    // want to know about this. If you don't; delete this!
    throw e;
  }
}
/* eslint-enable */

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const pluginHook = makePluginHook(
  [PostGraphileSupporter, PostGraphilePro].filter(_ => _)
);

function postgraphileOptions() {
  return {
    // This is for PostGraphile server plugins: https://www.graphile.org/postgraphile/plugins/
    pluginHook,

    // enableQueryBatching: On the client side, use something like apollo-link-batch-http to make use of this
    enableQueryBatching: true,

    // dynamicJson: instead of inputting/outputting JSON as strings, input/output raw JSON objects
    dynamicJson: true,

    // ignoreRBAC=false: honour the permissions in your DB - don't expose what you don't GRANT
    ignoreRBAC: false,

    // ignoreIndexes=false: honour your DB indexes - only expose things that are fast
    ignoreIndexes: false,

    // setofFunctionsContainNulls=false: reduces the number of nulls in your schema
    setofFunctionsContainNulls: false,

    // Enable GraphiQL in development
    graphiql: isDev,

    // Disable query logging - we're using morgan
    disableQueryLog: true,

    // See https://www.graphile.org/postgraphile/debugging/
    extendedErrors:
      isDev || isTest
        ? [
            "errcode",
            "severity",
            "detail",
            "hint",
            "positon",
            "internalPosition",
            "internalQuery",
            "where",
            "schema",
            "table",
            "column",
            "dataType",
            "constraint",
            "file",
            "line",
            "routine",
          ]
        : ["errcode"],
    showErrorStack: isDev,

    // Automatically update GraphQL schema when database changes
    watchPg: isDev,

    // Keep data/schema.graphql and data/schema.json up to date
    exportGqlSchemaPath: isDev
      ? `${__dirname}/../../data/schema.graphql`
      : null,
    exportJsonSchemaPath: isDev ? `${__dirname}/../../data/schema.json` : null,

    // Plugins to enhance the GraphQL schema, see:
    //   https://www.graphile.org/postgraphile/extending/
    appendPlugins: [PgSimplifyInflectorPlugin],

    graphileBuildOptions: {
      // Any properties here are merged into the settings passed to each Graphile
      // Engine plugin - useful for configuring how the plugins operate.

      // We install our own watch fixtures manually because we run PostGraphile
      // with non-database-owner privileges.
      pgSkipInstallingWatchFixtures: true,
    },

    // Tells Postgres who is accessing it (used in RLS policies/etc)
    async pgSettings(req) {
      const claims = await getUserClaimsFromRequest(req);
      return {
        role: process.env.DATABASE_VISITOR,
        ...Object.entries(claims).reduce((memo, [key, value]) => {
          if (!key.match(/^[a-z][a-z0-9A-Z-_]+$/)) {
            throw new Error("Invalid claim key.");
          }
          // We use this key for compatibility with how PostGraphile processes
          // JWTs; we're not actually using JWTs here.
          memo[`jwt.claims.${key}`] = value;
          return memo;
        }, {}),
      };
    },

    // These properties are merged into context, the third argument to GraphQL
    // resolvers. This is useful if you write your own plugins that need access
    // to e.g. the logged in user.
    async additionalGraphQLContextFromRequest(req) {
      const claims = getUserClaimsFromRequest(req);
      return {
        claims,
      };
    },

    // Supporter plugin options
    ...(PostGraphileSupporter
      ? {
          simpleSubscriptions: true,
          // subscriptionAuthorizationFunction: 'app_hidden.authorize_subscription',
        }
      : null),

    // Pro plugin options
    ...(PostGraphilePro
      ? {
          defaultPaginationCap:
            parseInt(process.env.GRAPHQL_PAGINATION_CAP, 10) || 50,
          graphqlDepthLimit:
            parseInt(process.env.GRAPHQL_DEPTH_LIMIT, 10) || 12,
          graphqlCostLimit:
            parseInt(process.env.GRAPHQL_COST_LIMIT, 10) || 30000,
          exposeGraphQLCost:
            (parseInt(process.env.HIDE_QUERY_COST, 10) || 0) < 1,
          // readReplicaPgPool ...,
        }
      : null),
  };
}

module.exports = app => {
  const httpServer = app.get("httpServer");
  const authPgPool = app.get("authPgPool");

  const middleware = postgraphile(
    authPgPool,
    "app_public",
    postgraphileOptions()
  );
  app.use(middleware);

  if (enhanceHttpServerWithSubscriptions) {
    // Supporter plugin socket middlewares
    const socketMiddlewares = app.get("socketMiddlewares");
    enhanceHttpServerWithSubscriptions(httpServer, middleware, {
      middlewares: socketMiddlewares,
    });
  }
};

module.exports.postgraphileOptions = postgraphileOptions;
