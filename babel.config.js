module.exports = {
  presets: [
    '@rosemlabs/app',
    '@babel/preset-typescript',
    // [
    //   '@babel/preset-env',
    //   {
    //     useBuiltIns: 'usage',
    //     shippedProposals: true,
    //     modules: false,
    //   },
    // ]
  ],
  plugins: [
    // Setting noInterop to true disables behavior where Babel creates synthetic
    // default exports. Setting this to match expected TypeScript behavior.
    // ['@babel/plugin-transform-modules-commonjs', { noInterop: true }],
  ],
}
