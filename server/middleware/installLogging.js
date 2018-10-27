const morgan = require("morgan");

module.exports = app => {
  app.use(morgan("combined"));
};
