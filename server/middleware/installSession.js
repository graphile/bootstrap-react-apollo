const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const { SECRET } = process.env;
const MAXIMUM_SESSION_DURATION_IN_MILLISECONDS =
  parseInt(process.env.MAXIMUM_SESSION_DURATION_IN_MILLISECONDS, 10) || 3 * DAY;

module.exports = app => {
  const pool = app.get("rootPgPool"); // from `middleware.installDatabasePools`
  const sessionMiddleware = session({
    rolling: true,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: MAXIMUM_SESSION_DURATION_IN_MILLISECONDS,
    },
    store: new PgSession({
      pool,
      schemaName: "app_private",
      tableName: "user_sessions",
    }),
    secret: SECRET,
  });
  app.use(sessionMiddleware);
  app.get("websocketMiddlewares").push(sessionMiddleware);
};
