module.exports = (/*context, options*/) => {
  // const presets = []
  //
  // // JSX
  // if (options.jsx !== false) {
  //   presets.push([
  //     require('@rosemlabs/babel-preset-jsx'),
  //     typeof options.jsx === 'object' ? options.jsx : {},
  //   ])
  // }

  return {
    // presets: [
    //   [
    //     '@babel/preset-env',
    //     {
    //       corejs: 3,
    //       useBuiltIns: 'usage',
    //       // Don't need to convert es modules for tree shaking support
    //       modules: false,
    //       shippedProposals: true,
    //     },
    //   ],
    // ],
    plugins: [
      // Stage 1
      '@babel/plugin-proposal-export-default-from',

      // Stage 2
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-function-sent',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-throw-expressions',

      // Stage 3
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      '@babel/plugin-proposal-json-strings',

      // Additional
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
    ],
  }
}
