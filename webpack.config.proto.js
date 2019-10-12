exports.default = WebpackPresetManager({})
  .use(IOPreset({
    entry: '..',
  }), /*rewrite?*/true)
  .use(DevPreset())
  .use(LintPreset())
  .use(TestPreset())
  .use(HtmlPreset())
  .use(StylePreset({
    sourceMap: true,
    lang: 'postcss'
  }))
  .use(JavascriptPreset())
  .use(TypescriptPreset({
    appendTsSuffixTo: '\\.sfc$',
    useTsx: true,
  }))
  .use(SFCPreset())

// Concept
module.exports = webpackConfig({
  presets: ['@rosemlabs/webpack-config-preset-app'],
  config: [
    [
      '@rosemlabs/webpack-config-io',
      {
        entry: './packages/@rosemlabs/app/index.ts',
      },
    ],
    '@rosemlabs/webpack-config-dev',
    '@rosemlabs/webpack-config-babel',
    [
      '@rosemlabs/webpack-config-typescript',
      {
        appendTsSuffixTo: [
          '\\.sfc$',
        ],
      },
    ],
  ],
});
