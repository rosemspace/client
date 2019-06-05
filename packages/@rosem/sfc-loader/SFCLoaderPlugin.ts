import querystring, { ParsedUrlQuery } from 'querystring'
import { RuleSetRule, loader, compilation, compiler } from 'webpack'
import LoaderContext = loader.LoaderContext
import Compilation = compilation.Compilation
import Compiler = compiler.Compiler
const RuleSet = require('webpack/lib/RuleSet')
import {
  NormalizedRuleSetRule,
  NormalizedRuleSetUseItem,
} from './normalizedRule'
import { SFC_KEYWORD, SFC_LOADER_IDENT } from './index'

export const SFC_LOADER_PLUGIN_ID = `${SFC_LOADER_IDENT}-plugin`

export default class SFCLoaderPlugin {
  static IDENT = SFC_LOADER_IDENT

  readonly SFC_KEYWORD = SFC_KEYWORD

  apply(compiler: Compiler) {
    // add NAMESPACE marker so that the loader can detect and report missing
    // plugin
    if (compiler.hooks) {
      // webpack 4
      compiler.hooks.compilation.tap(
        SFC_LOADER_PLUGIN_ID,
        (compilation: Compilation) => {
          let normalModuleLoader
          if (Object.isFrozen(compilation.hooks)) {
            // webpack 5
            normalModuleLoader = require('webpack/lib/NormalModule').getCompilationHooks(
              compilation
            ).loader
          } else {
            normalModuleLoader = compilation.hooks.normalModuleLoader
          }
          normalModuleLoader.tap(
            SFC_LOADER_PLUGIN_ID,
            (loaderContext: LoaderContext | any) => {
              loaderContext[SFC_LOADER_IDENT] = true
            }
          )
        }
      )
    } else {
      // webpack < 4
      compiler.plugin('compilation', (compilation) => {
        compilation.plugin(
          'normal-module-loader',
          (loaderContext: LoaderContext | any) => {
            loaderContext[SFC_LOADER_IDENT] = true
          }
        )
      })
    }

    // use webpack's RuleSet utility to normalize user rules
    // todo module check
    const rawRules: RuleSetRule[] = compiler.options.module!.rules
    const { rules } = new RuleSet(rawRules) as {
      rules: NormalizedRuleSetRule[]
    }
    // find the rule that applies to SFC files
    let sfcRuleIndex = rawRules.findIndex(
      createMatcher(`a.${this.SFC_KEYWORD}`)
    )

    if (sfcRuleIndex < 0) {
      sfcRuleIndex = rawRules.findIndex(
        createMatcher(`a.${this.SFC_KEYWORD}.html`)
      )
    }

    const sfcRule: NormalizedRuleSetRule = rules[sfcRuleIndex]

    if (!sfcRule) {
      throw new Error(
        `[SFCLoaderPlugin Error] No matching rule for .${
          this.SFC_KEYWORD
        } files found.\n` +
          `Make sure there is at least one root-level rule that matches .${
            this.SFC_KEYWORD
          } or .${this.SFC_KEYWORD}.html files.`
      )
    }

    if (sfcRule.oneOf) {
      throw new Error(
        `[SFCLoaderPlugin Error] sfc-loader currently does not support rules with oneOf.`
      )
    }

    // get the normalized "use" for SFC files
    const sfcUse = sfcRule.use
    // get sfc-loader options
    const sfcLoaderUseIndex = sfcUse.findIndex((u) => {
      return /^sfc-loader|([\/\\@])sfc-loader/.test(u.loader)
    })

    if (sfcLoaderUseIndex < 0) {
      throw new Error(
        `[SFCLoaderPlugin Error] No matching use for sfc-loader is found.\n` +
          `Make sure the rule matching .${
            this.SFC_KEYWORD
          } files include sfc-loader in its use.`
      )
    }

    // make sure sfc-loader options has a known ident so that we can share
    // options by reference in the template-loader by using a ref query like
    // template-loader??sfc-loader
    const sfcLoaderUse: NormalizedRuleSetUseItem = sfcUse[sfcLoaderUseIndex]

    sfcLoaderUse.ident = SFC_LOADER_IDENT
    sfcLoaderUse.options = sfcLoaderUse.options || {}

    // for each user rule (expect the SFC rule), create a cloned rule
    // that targets the corresponding language blocks in *.sfc files.
    const clonedRules: RuleSetRule[] = []

    rules.forEach((rule: NormalizedRuleSetRule) => {
      if (rule !== sfcRule && rule.resource) {
        // todo how to avoid second check?
        clonedRules.push(cloneRule(rule))
      }
    })

    // // global pitcher (responsible for injecting template compiler loader & CSS
    // // post loader)
    // const pitcher = {
    //   loader: require.resolve('./loaders/pitcher'),
    //   resourceQuery: (query: string) => {
    //     const parsed: ParsedUrlQuery = querystring.parse(query.slice(1))
    //
    //     return parsed[this.SFC_KEYWORD] != null
    //   },
    //   options: {
    //     cacheDirectory: sfcLoaderUse.options.cacheDirectory,
    //     cacheIdentifier: sfcLoaderUse.options.cacheIdentifier,
    //   },
    // }

    // replace original rules
    // todo module check
    compiler.options.module!.rules = [/*pitcher, */ ...clonedRules, ...rules]
  }
}

function createMatcher(fakeFile: string): (rawRule: RuleSetRule) => boolean {
  return (rawRule: RuleSetRule): boolean => {
    // We need to skip the `include` and the `exclude` checks when locating
    // the SFC rule, because the fake file may not match in this case
    const clonedRawRule = { ...rawRule }

    delete clonedRawRule.include
    delete clonedRawRule.exclude

    const rule: NormalizedRuleSetRule = RuleSet.normalizeRule(
      clonedRawRule,
      {},
      ''
    )

    return !rawRule.enforce && rule.resource && rule.resource(fakeFile)
  }
}

function cloneRule(
  rule: NormalizedRuleSetRule,
  sfcKey = SFC_KEYWORD
): RuleSetRule {
  const { resource, resourceQuery } = rule
  // Assuming `test` and `resourceQuery` tests are executed in series and
  // synchronously (which is true based on RuleSet's implementation), we can
  // save the current resource being matched from `test` so that we can access
  // it in `resourceQuery`. This ensures when we use the normalized rule's
  // resource check, include/exclude are matched correctly.
  let currentResource: string

  const newRule: RuleSetRule = {
    ...rule,
    resource: {
      test(resource: string): true {
        currentResource = resource

        return true
      },
    },
    resourceQuery(query: string): boolean {
      const parsed: ParsedUrlQuery = querystring.parse(query.slice(1))

      // todo optimize
      if (null == parsed[sfcKey] || (resource && null == parsed.lang)) {
        return false
      }

      return !(
        (resource &&
          !(resource as (path: string) => boolean)(
            `${currentResource}.${parsed.lang}`
          )) ||
        (resourceQuery && !(resourceQuery as (path: string) => boolean)(query))
      )
    },
  }

  if (rule.oneOf) {
    newRule.oneOf = rule.oneOf.map(() => cloneRule(rule, sfcKey))
  }

  return newRule
}
