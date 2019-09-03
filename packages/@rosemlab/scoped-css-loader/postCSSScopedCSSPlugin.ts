import { plugin, Transformer, Root, Rule } from 'postcss'

const PLUGIN_NAME: string = '@rosemlab/postcss-scoped-css'

type ScopedCSSPluginOptions = {
  scopeId: string
}

export = plugin(PLUGIN_NAME, function scopedCSS(
  options?: ScopedCSSPluginOptions
): Transformer {
  if (!options || !options.scopeId) {
    throw new Error('scope id is required for scoped CSS')
  }

  const scopeId: string = options.scopeId

  return function(root: Root): void {
    root.walkRules(function(rule: Rule) {
      // console.log(rule);
      // rule.selectors.forEach((selector: string): void => {
      //   console.log(selector);
      // })
      rule.selectors = rule.selectors.map((selector: string): string =>
        '*' === selector ? `.s${scopeId}` : `${selector}.s${scopeId}`
      )
    })
  }
})
