# PostGraphile Boilerplate - React & Apollo

This repository will help you get started with PostGraphile quickly. It's currently a work in progress, but despite this it should be a good jumping-off point.

## Goals:

Database:

- [x] Basic setup script to setup/reset database (`yarn setup`)
- [x] Basic migrations system with migrate/rollback commands (`yarn db:migrate:dev` / `yarn db:rollback:dev`)
- [x] Migration templating to support different role names
- [x] Dump database after every migration to ensure everyone's running the same

Server:

- [x] PostGraphile server, with Express
- [x] Development: GraphiQL (enhanced)
- [x] Development: watch DB for changes, no need to restart server
- [x] Development: maintain up-to-date GraphQL schema file (`./data/schema.graphql`)
- [x] Session-based authentication (cookies)
- [x] Database migrations framework (preferably flexible)
- [ ] User accounts (registration, login)
- [ ] OAuth support (login with GitHub, Twitter, Facebook, ... via Passport.js)
- [ ] Double-submit token to avoid CSRF
- [ ] Background worker
- [ ] Server-side rendering (SSR)
- [ ] Test suite

Client:

- [x] React app
- [x] Development mode has React hot loading
- [x] react-apollo GraphQL client
- [x] Send double-submit token (if present) with GraphQL requests (`window.CSRF_TOKEN`)
- [x] Routing via React Router
- [ ] Register/login with social providers
- [ ] Register with username/password
- [ ] Login with username/password
- [ ] [Storybook](https://storybook.js.org/) for React component previews
- [ ] Test suite
- [ ] Automatic bundle splitting

General:

- [x] JavaScript linting
- [x] GraphQL linting
- [x] Prettier for code formatting
- [x] Ignore relevant files in GitHub PRs (gitattributes `linguist-generated=true`)
- [ ] Production-optimised bundle

Deployment:

- [ ] Procfile for Heroku
- [ ] Dockerfile or similar

## Layout

The project is split into the following folders:

- `/db` - everything related to the database: migrations, unit tests, etc
- `/data` - generated data, such as the GraphQL and database schema dumps
- `/client` - everything related to the web browser: the react components, routes, etc
- `/server` - everything related to running the server: the middlewares, PostGraphile configuration, SSR, integration tests, etc
- `/worker` - everything related to background tasks; i.e. the job queue

We currently use a root-level `package.json` between all of them. In future we
might take a monorepo approach using yarn workspaces, but for now we figured
simplicity wins.

## Tools

We use the following tools to make our life easier

- PostGraphile (obviously) to turn our database into a GraphQL API, and to output the GraphQL schema for other tools
- Apollo Client to consume this GraphQL API and manage caching
- React for rendering
- Webpack to bundle everything up
- ESLint for powerful linting and autocorrection
- Prettier for consistent code formatting
- Express.js to implement our server
- db-migrate for performing migrations

## Getting Started

```
# Install dependencies:
yarn

# Create and configure database
yarn setup
```

{TODO}

## Environmental Variables

This package is configured through environmental variables.

## Conventions

{TODO}

## Deploying

{TODO}

## Database layout

- `public` - this is where extensions are installed to, it also contains the `migrations` table. We will typically not add anything to this schema ourselves.
- `app_public` - contains everything to be exposed over GraphQL
- `app_hidden` - same permissions as `app_public`, but will not be exposed over GraphQL
- `app_private` - database-owner-only storage, for storing things users should never have direct access to, like bcrypt password hashes.
- `app_jobs` - used for our job queue (requires database-owner privileges)

## Why the `/data` folder?

ESLint needs an up to date schema dump to correctly validate GraphQL queries.

When developing, you want to ensure that your database is identical to your
colleagues - differences in `/data/schema.sql` indicate that your databases
differ.

When performing Code Review, it's important to see the changes to both the
database and the GraphQL schemas to ensure no breaking changes are introduced.
