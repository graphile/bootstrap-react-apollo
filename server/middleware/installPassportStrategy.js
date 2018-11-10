const passport = require("passport");

/*
 * Stores where to redirect the user to on authentication success.
 * Tries to avoid redirect loops or malicious redirects.
 */
const setReturnTo = (req, res, next) => {
  const BLOCKED_REDIRECT_PATHS = /^\/+(|auth.*|logout)(\?.*)?$/;
  if (!req.session) {
    next();
    return;
  }
  const returnTo =
    (req.query && req.query.next && String(req.query.next)) ||
    req.session.returnTo;
  if (
    returnTo &&
    returnTo[0] === "/" &&
    !returnTo.match(BLOCKED_REDIRECT_PATHS)
  ) {
    req.session.returnTo = returnTo;
  } else {
    delete req.session.returnTo;
  }
  next();
};

module.exports = (
  app,
  service,
  Strategy,
  strategyConfig,
  authenticateConfig,
  getUserInformation,
  tokenNames = ["accessToken", "refreshToken"],
  { preRequest = () => {}, postRequest = () => {} } = {}
) => {
  const rootPgPool = app.get("rootPgPool");

  passport.use(
    new Strategy(
      {
        ...strategyConfig,
        callbackURL: `${process.env.ROOT_URL}/auth/${service}/callback`,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, extra, profile, done) => {
        try {
          const details = await getUserInformation(
            profile,
            accessToken,
            refreshToken,
            extra,
            req
          );
          if (!details.id) {
            throw new Error(
              `getUserInformation must return a unique id for each user`
            );
          }
          const {
            rows: [user],
          } = await rootPgPool.query(
            `select * from app_private.link_or_register_user($1, $2, $3, $4, $5);`,
            [
              (req.user && req.user.id) || null,
              service,
              details.id,
              JSON.stringify({
                username: details.username,
                avatar_url: details.avatarUrl,
                email: details.email,
                name: details.displayName,
                ...details.profile,
              }),
              JSON.stringify({
                [tokenNames[0]]: accessToken,
                [tokenNames[1]]: refreshToken,
                ...details.auth,
              }),
            ]
          );
          done(null, user);
        } catch (e) {
          done(e);
        }
      }
    )
  );

  app.get(`/auth/${service}`, setReturnTo, async (req, res, next) => {
    try {
      await preRequest(req);
    } catch (e) {
      next(e);
      return;
    }
    const realAuthDetails =
      typeof authenticateConfig === "function"
        ? authenticateConfig(req)
        : authenticateConfig;
    const step1Middleware = passport.authenticate(service, realAuthDetails);
    step1Middleware(req, res, next);
  });

  const step2Middleware = passport.authenticate(service, {
    failureRedirect: "/login",
    successReturnToOrRedirect: "/",
  });

  app.get(`/auth/${service}/callback`, async (req, res, next) => {
    try {
      await postRequest(req);
    } catch (e) {
      next(e);
      return;
    }
    step2Middleware(req, res, next);
  });
};
