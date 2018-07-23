module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
  ],
  env: {
    test: {
      presets: [
        [
          '@vue/app',
          {
            // Enable Babel's polyfills for Jest tests
            useBuiltIns: 'usage',
            // Use CommonJS modules for Jest tests
            modules: 'commonjs',
          },
        ],
      ],
    },
  },
}
