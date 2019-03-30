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
      entry: 'packages/@rosem/app/index.ts',
      // the source template
      template: 'packages/@rosem/app/index.html',
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
    //   entry: 'packages/@rosem/admin/index.ts',
    //   template: 'packages/@rosem/app/index.html',
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
    // entry: {
    // transition:
    //   './packages/@rosem/ui/lib/components/Transition/TransitionGroup.js',
    // htmlParser: './packages/@rosem/html-parser/index.ts',
    // },
    // Set up all the aliases we use in our app.
    resolve: {
      alias: require('./aliases.config').webpack,
    },
    // mode: 'development',
    // optimization: {
    //   usedExports: true,
    // },
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
        {
          // before: require('./tests/mock-api')
        }),
  },
}
