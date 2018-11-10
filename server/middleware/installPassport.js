const passport = require("passport");
const { Strategy: GitHubStrategy } = require("passport-github");
const get = require("lodash/get");
const installPassportStrategy = require("./installPassportStrategy");

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
    // This MUST be 'false', not 'null', due to how Passport works.
    return false;
  }
  return user;
}

module.exports = async app => {
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

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  if (process.env.GITHUB_KEY) {
    await installPassportStrategy(
      app,
      "github",
      GitHubStrategy,
      {
        clientID: process.env.GITHUB_KEY,
        clientSecret: process.env.GITHUB_SECRET,
        includeEmail: true,
      },
      {
        scope: ["include_email=true"],
      },
      async (profile, _accessToken, _refreshToken, _extra, _req) => ({
        id: profile.id,
        displayName: profile.displayName || "",
        username: profile.username,
        avatarUrl: get(profile, "photos.0.value"),
        email: get(profile, "emails.0.value"),
      }),
      ["token", "tokenSecret"]
    );
  }
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
