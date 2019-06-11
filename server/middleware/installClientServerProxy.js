/* eslint-disable no-console */
const httpProxy = require("http-proxy");

module.exports = function installFrontendServer(app) {
  const httpServer = app.get("httpServer");
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${process.env.CLIENT_PORT}`,
    ws: true,
  });
  proxy.on("error", e => {
    console.error("Proxy error occurred:", e);
  });
  app.use((req, res, _next) => {
    proxy.web(req, res, {}, e => {
      console.error(e);
      res.statusCode = 503;
      res.end(
        `Error occurred while proxying to client application - is it running? ${
          e.message
        }`
      );
    });
  });
  httpServer.on("upgrade", (req, socket, head) => {
    proxy.ws(req, socket, head);
  });
};
