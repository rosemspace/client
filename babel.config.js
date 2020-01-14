module.exports = {
  presets: [
    '@rosemlabs/babel-preset-app',
    ['@babel/preset-typescript' /*, {
      allExtensions: true
    }*/],
  ],
  plugins: [
    // Setting noInterop to true disables behavior where Babel creates synthetic
    // default exports. Setting this to match expected TypeScript behavior.
    // ['@babel/plugin-transform-modules-commonjs', { noInterop: true }],
  ],
  env: {
    browser: {
      presets: [
        [
          '@babel/preset-env',
          {
            corejs: 3,
            useBuiltIns: 'usage',
            shippedProposals: true,
            // Don't need to convert es modules for tree shaking
            modules: false,
          },
        ],
      ],
    },
  },
}
