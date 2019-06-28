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
  presets: ['@rosemlab/webpack-config-preset-app'],
  config: [
    [
      '@rosemlab/webpack-config-io',
      {
        entry: './packages/@rosemlab/app/index.ts',
      },
    ],
    '@rosemlab/webpack-config-dev',
    '@rosemlab/webpack-config-babel',
    [
      '@rosemlab/webpack-config-typescript',
      {
        appendTsSuffixTo: [
          '\\.sfc$',
        ],
      },
    ],
  ],
});
