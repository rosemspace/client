const appConfig = require('./src/app.config')
const packageJson = require('./package.json');
const workspaces = Array.isArray(packageJson.workspaces)
  ? packageJson.workspaces
  : packageJson.workspaces.packages;

module.exports = {
  transpileDependencies: [
    // add your modules here need to be transpiled
  ].concat(workspaces.map(workspace => new RegExp(`(\\\\|\\/)${workspace.replace(/^[\w-]+\/|\/\*$/, '')}\\1`))),
  chainWebpack: function (config) {
    // chain your configuration here
  },
  configureWebpack: {
    // We provide the app's title in Webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: appConfig.meta.title,
    // Set up all the aliases we use in our app.
    resolve: {
      alias: require('./aliases.config').webpack,
      extensions: ['.wasm', '.mjs']
    },
  },
  css: {
    // Enable CSS source maps.
    sourceMap: true,
  },
  // Configure Webpack's dev server.
  // https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md
  devServer: {
    ...(process.env.API_BASE_URL
      ? // Proxy API endpoints to the production base URL.
        { proxy: { '/api': { target: process.env.API_BASE_URL } } }
      : // Proxy API endpoints a local mock API.
        { before: require('./tests/mock-api') }),
  },
}
