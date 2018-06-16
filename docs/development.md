# Setup and development

- [First-time setup](#first-time-setup)
- [Installation](#installation)
- [Dev server](#dev-server)
  - [Developing with the production API](#developing-with-the-production-api)
- [Generators](#generators)
- [Webpack](#webpack)
- [Aliases](#aliases)
- [Globals](#globals)
  - [Base components](#base-components)

## First-time setup

Make sure you have the following installed:

- [Node](https://nodejs.org/en/) (at least the latest LTS)
- [Npm](https://docs.npmjs.com/cli/install/) (at least 6.0)

Then update the following files to suit your application:

- `src/app.config.js` (provides metadata about your app)
- `.circleci/config.yml` (assuming you want to automatically [deploy to production](production.md) with continuous integration)

## Installation

```bash
# Install dependencies from package.json
npm install
```

## Dev server

> Note: If you're on Linux and see an `ENOSPC` error when running the commands below, you must [increase the number of available file watchers](https://stackoverflow.com/questions/22475849/node-js-error-enospc#answer-32600959).

```bash
# Launch the dev server
npm run dev

# Launch the dev server and automatically open it in
# your default browser when ready
npm run dev --open

# Launch the dev server with the Cypress client for
# test-driven development in a friendly interface
npm run dev:e2e
```

### Developing with the production API

By default, dev and tests filter requests through [the mock API](/docs/tests.md#the-mock-api) in `tests/mock-api`. To test directly against a local/live API instead, run dev and test commands with the `API_BASE_URL` environment variable set. For example:

```bash
# To develop against a local backend server
API_BASE_URL=http://localhost:3000 npm run dev

# To test and develop against a production server
API_BASE_URL=https://example.io npm run dev:e2e
```

## Generators

This project includes generators to speed up common development tasks. Commands include:

```bash
# Generate a new component with adjacent unit test
npm run new component

# Generate a new view component with adjacent unit test
npm run new view

# Generate a new layout component with adjacent unit test
npm run new layout

# Generate a new Vuex module with adjacent unit test
npm run new module

# Generate a new utility function with adjacent unit test
npm run new util

# Generate a new end-to-end spec
npm run new e2e
```

Update existing or create new generators in the `_templates` folder, with help from the [Hygen docs](http://www.hygen.io/).

## Webpack

To [resolve the webpack configuration](https://cli.vuejs.org/guide/webpack.html#using-resolved-config-as-a-file) in your IDE you should use the following path:

```bash
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

To [see the whole webpack configuration](https://cli.vuejs.org/guide/webpack.html#inspecting-the-project-s-webpack-config) run the `inspect` command:

```bash
vue inspect
```

or put it into a file:

```bash
vue inspect > output.js
```

## Aliases

To simplify referencing local modules and refactoring, you can set aliases to be shared between dev and unit tests in `aliases.config.js`. As a convention, this project uses an `@` prefix to denote aliases.

## Globals

### Base components

[Base components](https://vuejs.org/v2/style-guide/#Base-component-names-strongly-recommended) (a.k.a. presentational, dumb, or pure components) that apply app-specific styling and conventions should all begin with the `_base-` prefix. Since these components are typically used in place of raw HTML element (and thus used as frequently), they're automatically globally registered for convenience. This means you don't have to import and locally register them to use them in templates.
