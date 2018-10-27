/* eslint-disable no-console */
const { readFile: readFileCallback } = require("fs");
const { promisify } = require("util");
const chalk = require("chalk");

const readFile = promisify(readFileCallback);

function findWatchFixtures() {
  try {
    return require.resolve(
      "postgraphile/node_modules/graphile-build-pg/res/watch-fixtures.sql"
    );
  } catch (_e) {
    return require.resolve("graphile-build-pg/res/watch-fixtures.sql");
  }
}

module.exports = async app => {
  const rootPgPool = app.get("rootPgPool");
  const fixtures = await readFile(findWatchFixtures(), "utf8");
  try {
    await rootPgPool.query(fixtures);
    console.log(chalk.bold(`Loaded PostgreSQL watch fixtures ✅`));
  } catch (e) {
    console.error("Failed to load watch fixtures 🔥");
    console.error(e);
  }
};
