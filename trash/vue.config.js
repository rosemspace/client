const packageJson = require('./package.json')
const workspaces = packageJson.workspaces
const packages = Array.isArray(workspaces) ? workspaces : workspaces.packages

module.exports = {
  pages: {
    // when using the entry-only string format,
    // template is inferred to be `public/admin.html`
    // and falls back to `public/index.html` if not found.
    // Output filename is inferred to be `admin.html`.
    index: {
      // entry for the page
      entry: 'packages/@rosemlabs/vue-app/main.ts',
      // the source template
      template: 'packages/@rosemlabs/app/index.html',
      // output as dist/index.html
      // filename: 'index.html',
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Rosem | Home Page',
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      // chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    // admin: {
    //   entry: 'packages/@rosemlabs/admin/index.ts',
    //   template: 'packages/@rosemlabs/app/index.html',
    //   title: 'Rosem | Admin Page',
    // },
  },
  transpileDependencies: [
    // add your modules here need to be transpiled
    'lodash-es',
  ].concat(
    packages.map(
      (pckg) => new RegExp(`([\\/])${pckg.replace(/^[\w-]+\/|\/\*$/, '')}\\1`)
    )
  ),
  chainWebpack: function(config) {
    // chain your configuration here
    // config.module.rule('ts')
  },
  configureWebpack: {
    entry: {
    // transition: './packages/@rosemlabs/ui-transition/Transition.ts',
    // htmlParser: './packages/@rosemlabs/html-parser/index.ts',
    },
    // Set up all the aliases we use in our app.
    resolve: {
      alias: require('./aliases.config').webpack,
    },
    // mode: 'development',
    // optimization: {
    //   usedExports: true,
    // },
    performance: {
      // Only enable performance hints for production builds,
      // outside of tests.
      hints:
        process.env.NODE_ENV === 'production' &&
        !process.env.VUE_APP_TEST &&
        'warning',
    },
  },
  css: {
    // Enable CSS source maps.
    sourceMap: true,
  },
  // Configure Webpack's dev server.
  // https://cli.vuejs.org/guide/cli-service.html
  devServer: {
    ...(process.env.API_BASE_URL
      ? // Proxy API endpoints to the production base URL.
        { proxy: { '/api': { target: process.env.API_BASE_URL } } }
      : // Proxy API endpoints a local mock API.
        {
          // before: require('./tests/mock-api')
        }),
  },
}
