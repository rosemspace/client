// App-specific config

// Using CommonJS instead of ES2015+ export, because we also need to
// provide this object to Webpack in vue.config.js.
module.exports = {
  meta: {
    title: 'Rosem Vue modular boilerplate',
    description: 'This is Rosem Vue modular boilerplate!',
  },
}
