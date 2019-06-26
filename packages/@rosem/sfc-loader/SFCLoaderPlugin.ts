import { RuleSetRule, loader, compilation, compiler } from 'webpack'
import LoaderContext = loader.LoaderContext
import Compilation = compilation.Compilation
import Compiler = compiler.Compiler
const RuleSet = require('webpack/lib/RuleSet')
import querystring from 'querystring'
import {
  NormalizedRuleSetRule,
  NormalizedRuleSetUseItem,
} from './normalizedRule'
import cloneRule from './cloneRule'
import { SFC_KEYWORD, SFC_LOADER_IDENT } from './index'

export const SFC_LOADER_PLUGIN_ID = `SFCLoaderPlugin`

export type BlockLangMap = { [block: string]: string }

export type SFCLoaderPluginOptions = {
  fileExtension: string
  blockLangMap: BlockLangMap
}

export function getOptions(
  loaderContext: LoaderContext
): SFCLoaderPluginOptions {
  return (loaderContext as any)[SFC_LOADER_IDENT]
}

export const defaultBlockLangMap: BlockLangMap = {
  template: 'html',
  script: 'js',
  style: 'css',
}

export default class SFCLoaderPlugin {
  static IDENT = SFC_LOADER_IDENT

  readonly options: SFCLoaderPluginOptions

  constructor(options: Partial<SFCLoaderPluginOptions> = {}) {
    this.options = {
      fileExtension: SFC_KEYWORD,
      ...options,
      blockLangMap: {
        ...defaultBlockLangMap,
        ...(options.blockLangMap || {}),
      },
    }
  }

  apply(compiler: Compiler) {
    if (!compiler.options.module) {
      return
    }

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
              loaderContext[SFC_LOADER_IDENT] = this.options
            }
          )
        }
      )
    } else {
      // webpack < 4
      compiler.plugin('compilation', (compilation: Compilation) => {
        compilation.plugin(
          'normal-module-loader',
          (loaderContext: LoaderContext | any) => {
            loaderContext[SFC_LOADER_IDENT] = this.options
          }
        )
      })
    }

    // use webpack's RuleSet utility to normalize user rules
    const rawRules: RuleSetRule[] = compiler.options.module.rules
    const { rules } = new RuleSet(rawRules) as {
      rules: NormalizedRuleSetRule[]
    }
    // find the rule that applies to SFC files
    let sfcRuleIndex = rawRules.findIndex(
      createMatcher(`a.${this.options.fileExtension}`)
    )

    if (sfcRuleIndex < 0) {
      sfcRuleIndex = rawRules.findIndex(
        createMatcher(`a.${this.options.fileExtension}.html`)
      )
    }

    const sfcRule: NormalizedRuleSetRule = rules[sfcRuleIndex]

    if (!sfcRule) {
      throw new Error(
        `[SFCLoaderPlugin Error] No matching rule for .${
          this.options.fileExtension
        } files found.\n` +
          `Make sure there is at least one root-level rule that matches .${
            this.options.fileExtension
          } or .${this.options.fileExtension}.html files.`
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
      return new RegExp(`^${SFC_LOADER_IDENT}|[/\@]${SFC_LOADER_IDENT}`).test(
        u.loader
      )
    })

    if (sfcLoaderUseIndex < 0) {
      throw new Error(
        `[SFCLoaderPlugin Error] No matching use for sfc-loader is found.\n` +
          `Make sure the rule matching .${
            this.options.fileExtension
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
      // When the user defines a rule that has only resourceQuery but no test,
      // both that rule and the cloned rule will match, resulting in duplicated
      // loaders. Therefore it is necessary to perform a dedupe here.
      if (rule !== sfcRule) {
        // && (rule.resource || !rule.resourceQuery)) {
        clonedRules.push(cloneRule(rule, this.options.fileExtension))
      }
    })

    // global pitcher (responsible for injecting template compiler loader & CSS
    // post loader)
    const pitcher = {
      loader: require.resolve('./dedupLoader'),
      resourceQuery: (query: string): boolean => {
        // `.slice(1)` - remove "?" character
        return (
          querystring.parse(query.slice(1))[this.options.fileExtension] != null
        )
      },
      // options: {
      //   cacheDirectory: sfcLoaderUse.options.cacheDirectory,
      //   cacheIdentifier: sfcLoaderUse.options.cacheIdentifier,
      // },
    }

    // replace original rules
    compiler.options.module.rules = [pitcher, ...clonedRules, ...rules]
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
