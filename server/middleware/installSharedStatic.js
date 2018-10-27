const express = require("express");

module.exports = app => {
  app.use(express.static(`${__dirname}/../public`));
};
