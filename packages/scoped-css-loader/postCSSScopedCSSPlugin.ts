import { Declaration, plugin, Root, Transformer } from 'postcss'
import selectorParser from 'postcss-selector-parser'
import { ScopeType } from './index'

type ScopedCSSPluginOptions = {
  scopeId: string
  scopeType?: ScopeType
}

export default plugin('scoped-css', function scopedCSS(
  options?: ScopedCSSPluginOptions
): Transformer {
  if (!options || !options.scopeId) {
    throw new Error('scope id is required for scoped CSS')
  }

  const scopeId: string = options.scopeId
  const keyframes = Object.create(null)

  return (root: Root): void => {
    // root.walkRules(function(rule: Rule) {
    //   // console.log(rule);
    //   // rule.selectors.forEach((selector: string): void => {
    //   //   console.log(selector);
    //   // })
    //   rule.selectors = rule.selectors.map((selector: string): string =>
    //     {
    //       // list.space(selector).map((selector: string): string => '')
    //       return '*' === selector ? `.s${scopeId}` : `${selector}.s${scopeId}`
    //     }
    //   )
    // })

    root.each(function rewriteSelector(node: any) {
      if (!node.selector) {
        // handle media queries
        if (node.type === 'atrule') {
          if (node.name === 'media' || node.name === 'supports') {
            node.each(rewriteSelector)
          } else if (/-?keyframes$/.test(node.name)) {
            // Register keyframes
            keyframes[node.params] = node.params = node.params + '-' + scopeId
          }
        }
        return
      }
      node.selector = selectorParser((selectors: any) => {
        selectors.each((selector: any) => {
          let node: any = null

          // Find the last child node to insert attribute selector
          selector.each((n: any) => {
            // ">>>" combinator
            if (n.type === 'combinator' && n.value === '>>>') {
              n.value = ' '
              n.spaces.before = n.spaces.after = ''

              return false
            }

            // add a ::unscopables alias, since >>> doesn't work in SASS
            if (n.type === 'pseudo' && n.value === '::unscopables') {
              n.value = n.spaces.before = n.spaces.after = ''

              return false
            }

            if (n.type !== 'pseudo' && n.type !== 'combinator') {
              node = n
            }
          })

          if (node) {
            node.spaces.after = ''
          } else {
            // For deep selectors & standalone pseudo selectors,
            // the attribute selectors are prepended rather than appended.
            // So all leading spaces must be eliminated to avoid problems.
            selector.first.spaces.before = ''
          }

          selector.insertAfter(
            node,
            'class' === options.scopeType
              ? selectorParser.className({
                  value: scopeId,
                })
              : selectorParser.attribute({
                  attribute: scopeId,
                  raws: {},
                  value: undefined,
                })
          )
        })
      }).processSync(node.selector)
    })

    // If keyframes are found in this <style>, find and rewrite animation names
    // in declarations.
    // Caveat: this only works for keyframes and animation rules in the same
    // <style> element.
    if (Object.keys(keyframes).length) {
      root.walkDecls((decl: Declaration): void => {
        // Individual animation-name declaration
        if (/^(-\w+-)?animation-name$/.test(decl.prop)) {
          decl.value = decl.value
            .split(',')
            .map(
              (value: string): string => keyframes[value.trim()] || value.trim()
            )
            .join(',')
        }

        // Shorthand
        if (/^(-\w+-)?animation$/.test(decl.prop)) {
          decl.value = decl.value
            .split(',')
            .map((value: string): string => {
              const values: string[] = value.trim().split(/\s+/)
              const index: number = values.findIndex(
                (value: string): string => keyframes[value]
              )

              if (index !== -1) {
                values.splice(index, 1, keyframes[values[index]])

                return values.join(' ')
              } else {
                return value
              }
            })
            .join(',')
        }
      })
    }
  }
})
