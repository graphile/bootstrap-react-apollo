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
  app.get("websocketMiddlewares").push(passportInitializeMiddleware);

  const passportSessionMiddleware = passport.session();
  app.use(passportSessionMiddleware);
  app.get("websocketMiddlewares").push(passportSessionMiddleware);

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
  } else if (process.env.NODE_ENV === "development") {
    app.get("/auth/github", (req, res, _next) => {
      res.type("html").send(`\
<!DOCTYPE html>
<html>
<body>
<h1><code>process.env.GITHUB_KEY</code> not present</h1>
<p>To enable login with GitHub, create a GitHub application by visiting
<a
href="https://github.com/settings/applications/new">https://github.com/settings/applications/new</a>
and entering the details below. Once done, enter the Client ID/Secret into your
<code>.env</code> file and kill and restart the server.</p>

<table>
<tr><td>
Name:
</td><td>
<input size="40" readonly value="PostGraphile Bootstrap (Dev)" />
</td></tr>
<tr><td>
Homepage URL:
</td><td>
<input size="40" readonly value="http://localhost:5678" />
</td></tr>
<tr><td>
Authorization callback URL:
</td><td>
<input size="40" value="http://localhost:5678/auth/github/callback" />
</td></tr>
</table>
</body>
</html>
`);
    });
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
