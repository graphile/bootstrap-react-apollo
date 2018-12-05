/* eslint-disable no-console */
const express = require("express");
const { createServer } = require("http");
const chalk = require("chalk");
const sharedUtils = require("./utils");
const middleware = require("./middleware");
const packageJson = require("../package");

sharedUtils.sanitiseEnv();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const isDev = process.env.NODE_ENV === "development";

async function main() {
  /*
   * Our Express server
   */
  const app = express();

  /*
   * Getting access to the HTTP server directly means that we can do things
   * with websockets if we need to (e.g. GraphQL subscriptions).
   */
  const httpServer = createServer(app);
  app.set("httpServer", httpServer);

  /*
   * When we're using websockets, we may want them to have access to
   * sessions/etc for authentication.
   */
  const socketMiddlewares = [];
  app.set("socketMiddlewares", socketMiddlewares);

  /*
   * Middleware is installed from the /server/middleware directory. These
   * helpers may augment the express app with new settings and/or install
   * express middleware. These helpers may be asynchronous, but they should
   * operate very rapidly to enable quick as possible server startup.
   */
  await middleware.installDatabasePools(app);
  if (isDev) {
    /*
     * We're using a non-super-user connection string (authPgPool), so we need
     * to install the watch fixtures ourselves.
     */
    await middleware.installDatabaseWatchFixtures(app);
  }
  await middleware.installSession(app);
  await middleware.installPassport(app);
  await middleware.installLogging(app);
  // These are our assets: images/etc; served out of the /client/public folder
  await middleware.installSharedStatic(app);
  await middleware.installPostGraphile(app);
  // This proxies through to create-react-app
  await middleware.installFrontendServer(app);

  // And finally, we open the listen port
  httpServer.listen(PORT, () => {
    const address = httpServer.address();
    const actualPort =
      typeof address === "string" ? address : address.port || PORT;
    console.log();
    console.log(
      chalk.green(
        `${chalk.bold(packageJson.name)} listening on port ${chalk.bold(
          actualPort
        )}`
      )
    );
    console.log();
    console.log(
      `  Site:     ${chalk.bold.underline(`http://localhost:${actualPort}`)}`
    );
    console.log(
      `  GraphiQL: ${chalk.bold.underline(
        `http://localhost:${actualPort}/graphiql`
      )}`
    );
    console.log();
  });
}

main().catch(e => {
  console.error("Fatal error occurred starting server!");
  console.error(e);
  process.exit(1);
});
