const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const appConfig = require('./src/@rosem/vue-app/app.config') // TODO: move to config dir

module.exports = {
  configureWebpack: {
    // We provide the app's title in Webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: appConfig.title,
    // Set up all the aliases we use in our app.
    resolve: {
      alias: require('./aliases.config').webpack,
      // extensions: ['.wasm', '.mjs', '.js', '.json', '.vue']
    },
    module: {
      rules: [
        {
          test: /\.postcss$/,
          oneOf: [
            {
              resourceQuery: /module/,
              use: [
                {
                  loader: 'vue-style-loader',
                  options: {
                    sourceMap: false,
                    shadowMode: false,
                  },
                },
                {
                  loader: 'css-loader',
                  options: {
                    minimize: false,
                    sourceMap: false,
                    importLoaders: 1,
                    modules: true,
                    localIdentName: '[name]_[local]_[hash:base64:5]',
                  },
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: false,
                  },
                },
              ],
            },
            {
              use: [
                {
                  loader: 'vue-style-loader',
                  options: {
                    sourceMap: false,
                    shadowMode: false,
                  },
                },
                {
                  loader: 'css-loader',
                  options: {
                    minimize: false,
                    sourceMap: false,
                    importLoaders: 1,
                  },
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: false,
                    config: {
                      path: '.postcssrc.js',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    plugins: [
      // Optionally produce a bundle analysis
      // TODO: Remove once this feature is built into Vue CLI
      new BundleAnalyzerPlugin({
        analyzerMode: process.env.ANALYZE ? 'static' : 'disabled',
        openAnalyzer: process.env.CI !== 'true',
      }),
    ],
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
