/* eslint-disable no-console */
const express = require("express");
const { Nuxt, Builder } = require('nuxt')
const { createServer } = require("http");
const chalk = require("chalk");
const sharedUtils = require("./utils");
const middleware = require("./middleware");
const packageJson = require("../package");
const consola = require('consola')


sharedUtils.sanitiseEnv();
const isDev = !(process.env.NODE_ENV === "production");
const CLIENT_PORT = process.env.CLIENT_PORT;

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
// Init Nuxt.js
const nuxt = new Nuxt(config)
const { host, port: hostPort } = nuxt.options.server
const PORT = hostPort;


async function main() {

  /*
  * Build nuxtjs only in dev mode
  */
  if (isDev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

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
  const websocketMiddlewares = [];
  app.set("websocketMiddlewares", websocketMiddlewares);

  /*
   * Middleware is installed from the /server/middleware directory. These
   * helpers may augment the express app with new settings and/or install
   * express middleware. These helpers may be asynchronous, but they should
   * operate very rapidly to enable quick as possible server startup.
   */
  await middleware.installDatabasePools(app);
  await middleware.installPassport(app);
  await middleware.installSession(app);
  await middleware.installLogging(app);
  // These are our assets: images/etc; served out of the /client/public folder
  await middleware.installSharedStatic(app);
  await middleware.installPostGraphile(app);

  /*
   * Give nuxt middleware to express
   ! Needs to be placed after `middleware.installPostGraphile`
   ! otherwise postgraphile routes won't work
   */
  app.use(nuxt.render);

  // And finally, we open the listen port
  httpServer.listen(PORT, () => {
    const address = httpServer.address();
    const actualPort =
      typeof address === "string" ? address : address.port || PORT;
    consola.ready({
      message: `
        ${chalk.bold(packageJson.name)} listening on port ${chalk.bold(actualPort)}
        Site:     ${chalk.bold.underline(`http://localhost:${actualPort}`)}
        GraphiQL: ${chalk.bold.underline(`http://localhost:${actualPort}/api/graphiql`)}
        GraphQL: ${chalk.bold.underline(`http://localhost:${actualPort}/api/graphql`)}
        `,
      badge: true
    });
  });
}

main().catch(e => {
  console.error("Fatal error occurred starting server!");
  console.error(e);
  process.exit(1);
});
