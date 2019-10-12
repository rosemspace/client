import isString from 'lodash/isString'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { getOptions, stringifyRequest } from 'loader-utils'
import querystring, { ParsedUrlQuery } from 'querystring'
import { SFC_LOADER_IDENT, SFCLoaderOptions } from '@rosemlabs/sfc-loader/index'
import scopedCSSLoader from '@rosemlabs/scoped-css-loader'
import {
  getOptions as getPluginOptions,
  SFCLoaderPluginOptions,
} from './SFCLoaderPlugin'

type ResolvedLoader = {
  request: string
  path: string
  query: string
  module: Function
}

const scopedCSSLoaderPath = require.resolve('@rosemlabs/scoped-css-loader')
const isPitcher = (loader: ResolvedLoader): boolean =>
  __filename === loader.path
const isNullLoader = (loader: ResolvedLoader): boolean =>
  /[/\\@]null-loader/.test(loader.path)
const isCSSLoader = (loader: ResolvedLoader): boolean =>
  /[/\\@]css-loader/.test(loader.path)
const isCacheLoader = (loader: ResolvedLoader): boolean =>
  /[/\\@]cache-loader/.test(loader.path)
const sfcLoaderPath = require.resolve('./index')
const isSFCLoader = (loader: ResolvedLoader): boolean =>
  loader.path === sfcLoaderPath
const shouldIgnoreCustomBlock = (loaders: ResolvedLoader[]) => {
  const actualLoaders: ResolvedLoader[] = loaders.filter((loader) => {
    return !isPitcher(loader) && !isSFCLoader(loader) && !isCacheLoader(loader)
  })

  return 0 === actualLoaders.length
}
const isStyleLang = (lang: string): boolean =>
  /^((post)?c|le|s[a|c])ss|styl$/.test(lang)

export default function(source: string): string {
  return source
}

export function pitch(this: LoaderContext): string | void {
  // do not inject if user uses null-loader to void the type
  if (this.loaders.some(isNullLoader)) {
    return
  }

  // if a custom block has no other matching loader other than sfc-loader itself
  // or cache-loader, we should ignore it
  if (shouldIgnoreCustomBlock(this.loaders)) {
    return ''
  }

  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
  const options: SFCLoaderOptions = { ...(getOptions(this) || {}) }
  // const pluginOptions: SFCLoaderPluginOptions = getPluginOptions(this)
  // todo cache
  const { cacheDirectory, cacheIdentifier } = options

  // When the user defines a rule that has only resourceQuery but no test,
  // both that rule and the cloned rule will match, resulting in duplicated
  // loaders. Therefore it is necessary to perform a dedupe here.
  // Also make sure to dedupe based on loader path and query to be safe.
  // Assumes you'd probably never want to apply the same loader on the same
  // file twice.
  const loaders: ResolvedLoader[] = this.loaders
  const seen: { [identifier: string]: boolean } = {}
  const loaderStrings: string[] = []

  // Inject scoped-css-loader before css-loader for scoped CSS // todo trimming
  if (
    'style' === query.block ||
    (query.lang && isStyleLang(query.lang.toString()))
  ) {
    const cssLoaderIndex: number = loaders.findIndex(isCSSLoader)

    if (cssLoaderIndex > -1) {
      loaders.splice(cssLoaderIndex + 1, 0, {
        // Use sfc-loader options in scoped-css-loader
        request: `${scopedCSSLoaderPath}??${SFC_LOADER_IDENT}`,
        path: scopedCSSLoaderPath,
        query: `??${SFC_LOADER_IDENT}`,
        module: scopedCSSLoader,
      })
    }
  }

  loaders.forEach((loader: ResolvedLoader) => {
    if (isPitcher(loader)) {
      return
    }

    const [identifier, request] = [loader.path + loader.query, loader.request]

    if (!seen[identifier]) {
      seen[identifier] = true
      // loader.request contains both the resolved loader path and its options
      // query (e.g. ??ref-0)
      loaderStrings.push(request)
    }
  })

  const request: string = stringifyRequest(
    this,
    '-!' + [...loaderStrings, this.resourcePath + this.resourceQuery].join('!')
  )

  return (
    `import m from ${request};\n` +
    `export default m;\n` +
    `export * from ${request};\n`
  )
}
