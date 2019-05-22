/*
 * Exports all the individual middleware files in this folder via lazy-load.
 */
const fs = require("fs");

const middlewares = fs
  .readdirSync(__dirname)
  .filter(fn => fn !== "index.js")
  .filter(fn => fn.match(/^[^.].*\.js$/))
  .map(str => str.substr(0, str.length - 3));

middlewares.forEach(name => {
  // Lazy-load the middlewares only when they're used.
  let module;
  const get = () => {
    if (!module) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      module = require(`./${name}`);
    }
    return module;
  };
  Object.defineProperty(exports, name, {
    configurable: true,
    enumerable: true,
    get,
  });
});
