/*
 * All the migrations call into this code, allowing us to enhance debugging,
 * etc. This overrides how db-migrate runs by default.
 *
 * https://db-migrate.readthedocs.io/en/latest/Getting%20Started/usage/#using-files-for-sqls
 */
const { readFile: readFileCallback } = require('fs');
const { promisify } = require('util');

const readFile = promisify(readFileCallback);

const migrate = up => baseMigrationName => {
  const filename = `${__dirname}/../migrations/${baseMigrationName}-${up ? 'up' : 'down'}.sql`;
  return async db => {
    const sql = await readFile(filename, "utf8");

    try {
      await db.runSql(sql);
    } catch (e) {
      if (e.position) {
        const pos = e.position;
        const pre = 40;
        const post = 80;
        const start = Math.max(e.position - pre, 0);
        console.log();
        const subString = sql.substr(0, pos);
        const newlines = subString.split(/\n/).length;
        console.log(`${e.severity} in ${filename}:${newlines}`);
        console.log(sql.substr(start, pos - start + post).replace(/\n/g, "⏎"));
        console.log(`${" ".repeat(pre)}^ ${e.message}`);
        console.log();
      } else if (e.where) {
        console.error(`${e.severity} in '${e.where}': '${e.detail}'`);
      } else {
        console.dir(e);
      }
      throw e;
    }
    await db.runSql("reset all;"); // Reset any `search_path` overrides/etc
  };
};

module.exports = base => {
  return {
    up: migrate(true)(base),
    down: migrate(false)(base),
  };
};
