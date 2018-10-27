const passport = require("passport");

// This is the primary key field on app_public.users; left configurable in case you want to change it to 'uuid'
// BEWARE: do not do a SQL injection attack on yourself!
const USER_IDENTIFIER_PROPERTY = "id";

async function getUserByIdentifier(rootPgPool, identifier) {
  const {
    rows: [user],
  } = await rootPgPool.query(
    `
      select
        users.*
      from app_public.users
      where users."${USER_IDENTIFIER_PROPERTY}" = $1
    `,
    [identifier]
  );
  if (!user) {
    return false;
  }
  return user;
}

module.exports = app => {
  const rootPgPool = app.get("rootPgPool");

  passport.serializeUser((user, done) => {
    done(null, user[USER_IDENTIFIER_PROPERTY]);
  });

  passport.deserializeUser((identifier, done) => {
    getUserByIdentifier(rootPgPool, identifier).then(
      user => done(null, user),
      e => done(e)
    );
  });

  const passportInitializeMiddleware = passport.initialize();
  app.use(passportInitializeMiddleware);
  app.get("socketMiddlewares").push(passportInitializeMiddleware);

  const passportSessionMiddleware = passport.session();
  app.use(passportSessionMiddleware);
  app.get("socketMiddlewares").push(passportSessionMiddleware);
};

module.exports.getUserClaimsFromRequest = async req => ({
  ...(req.user
    ? {
        [`user_${USER_IDENTIFIER_PROPERTY}`]: req.user[
          USER_IDENTIFIER_PROPERTY
        ],
      }
    : null),
});
