#!/usr/bin/env node
/*
 * Makes migration files in Benjie's preferred structure.
 *
 * https://db-migrate.readthedocs.io/en/latest/Getting%20Started/usage/#using-files-for-sqls
 */
const fs = require("fs");
const { dirname, relative } = require("path");

const root = dirname(__dirname);

/* Migration name */
const name = process.argv[2];
const NAME_REGEX = /^[a-z][a-z0-9-_.]*$/;
if (name && !name.match(NAME_REGEX)) {
  console.error(
    "Migration name is if the wrong format. We recommend SCHEMA.TYPE[.SUBJECT][.SUBJECT].ACTION; e.g. app_public.schema.create or app_public.column.users.bio.add_length_check"
  );
  process.exit(2);
}
if (!name || !name.length) {
  console.error(
    "Migration name is required, e.g. 'yarn db:migrate:create app_public.users.create'"
  );
  process.exit(1);
}
const allMigrations = fs.readdirSync(`${root}/migrations/migrations`);
const migrationWithSameName = allMigrations.find(n => n.substr(15) === `${name}.js`);
if (migrationWithSameName) {
  console.error(
    `Migration name is already in use: ${migrationWithSameName}, please pick a different migration name`
  );
  process.exit(1);
}

/* Migration timestamp */
const pad = i => (i < 10 ? `0${i}` : String(i));
const date = new Date();
const datestamp =
  `${date.getUTCFullYear()}_${pad(date.getUTCMonth() + 1)}_${pad(
    date.getUTCDate()
  )}__${pad(date.getUTCHours())}_${pad(date.getUTCMinutes())}_${pad(
    date.getUTCSeconds()
  )}`;
const compressedDatestamp = datestamp.replace(/_/g, '');

/* Create migration files */
const prefix = `${root}/migrations/${datestamp}-${name}`;
const boilerplateMigrationPath = `${root}/migrations/migrations/${compressedDatestamp}-${name}.js`;
fs.writeFileSync(
  boilerplateMigrationPath,
  `/* This is boilerplate, you want the parent directory for the actual migrations */
import {up as dbUp, down as dbDown} from '../../scripts/migrate';
export const up = dbUp(${JSON.stringify(`${datestamp}-${name}`)});
export const down = dbUp(${JSON.stringify(`${datestamp}-${name}`)});
`
);
fs.writeFileSync(`${prefix}-up.sql`, "");
fs.writeFileSync(`${prefix}-down.sql`, "");

/* Helpful(ish) output */
const rel = filepath => relative(`${root}/..`, filepath);
console.log("Created these up and down migrations for you, please go edit them:");
console.log();
console.log(`  ${rel(`${prefix}-up.sql`)}`);
console.log(`  ${rel(`${prefix}-down.sql`)}`);
console.log();
console.log("If you messed up the name and haven't ran migrated yet, you can remove them relevant files with this command:");
console.log();
console.log(`  rm "${rel(`${prefix}-up.sql`)}" "${rel(`${prefix}-down.sql`)}" "${rel(`${boilerplateMigrationPath}`)}"`);
