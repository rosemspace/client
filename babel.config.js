module.exports = {
  presets: [
    // '@rosemlabs/app',
    ['@babel/preset-typescript'/*, {
      allExtensions: true
    }*/],
    // [
    //   '@babel/preset-env',
    //   {
    //     useBuiltIns: 'usage',
    //     shippedProposals: true,
    //     // modules: false,
    //   },
    // ]
  ],
  plugins: [
    // Stage 1
    "@babel/plugin-proposal-export-default-from",

    // Stage 2
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    "@babel/plugin-proposal-function-sent",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-proposal-throw-expressions",

    // Stage 3
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-meta",
    ["@babel/plugin-proposal-class-properties", { "loose": false }],
    "@babel/plugin-proposal-json-strings",

    "@babel/plugin-proposal-optional-chaining"

    // Setting noInterop to true disables behavior where Babel creates synthetic
    // default exports. Setting this to match expected TypeScript behavior.
    // ['@babel/plugin-transform-modules-commonjs', { noInterop: true }],
  ],
}
