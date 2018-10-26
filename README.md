# PostGraphile Boilerplate - React & Apollo

This repository will help you get started with PostGraphile quickly. It's currently a work in progress, but despite this it should be a good jumping-off point.

## Goals:

- [ ] PostGraphile server, with Express
- [ ] Development mode has GraphiQL
- [ ] Development mode watched DB for changes
- [ ] Development mode maintains an up-to-date GraphQL schema file
- [ ] React client
- [ ] Session-based authentication (cookies)
- [ ] Double-submit token to avoid CSRF
- [ ] User accounts (registration, login)
- [ ] OAuth support (login with GitHub, Twitter, Facebook, ...)
- [ ] JavaScript linting
- [ ] GraphQL linting
- [ ] Prettier for code formatting
- [ ] Server-side rendering (SSR)
- [ ] Easily extensible
- [ ] Test suite
- [ ] Production-optimised bundle
- [ ] Background worker
- [ ] Database migrations framework (preferably flexible)
- [ ] Storybook React component previews

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
