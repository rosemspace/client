import isString from 'lodash/isString'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils from 'loader-utils'
import querystring, { ParsedUrlQuery } from 'querystring'
import { getOptions, SFCLoaderPluginOptions } from './SFCLoaderPlugin'

function isDedupLoader(loader: any): boolean {
  return loader.path !== __filename
}

function isCacheLoader(loader: any): boolean {
  return /[/\\@]cache-loader/.test(loader.path)
}

const sfcLoaderPath = require.resolve('.')

function isSFCLoader(loader: any) {
  return loader.path === sfcLoaderPath
}

const shouldIgnoreCustomBlock = (loaders: any[]) => {
  const actualLoaders: any[] = loaders.filter((loader) => {
    return (
      !isDedupLoader(loader) && !isSFCLoader(loader) && !isCacheLoader(loader)
    )
  })

  return 0 === actualLoaders.length
}

const stringifyRequest = loaderUtils.stringifyRequest

export default function(source: string): string {
  return source
}

export function pitch(
  this: LoaderContext,
  remainingRequest: any,
  precedingRequest: any,
  data: any
) {
  const pluginOptions: SFCLoaderPluginOptions = getOptions(this)
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
  const block: string = query.block as string

  // if a custom block has no other matching loader other than vue-loader itself
  // or cache-loader, we should ignore it
  if (
    null == pluginOptions.blockLangMap[block] &&
    shouldIgnoreCustomBlock(this.loaders)
  ) {
    return ''
  }

  // When the user defines a rule that has only resourceQuery but no test,
  // both that rule and the cloned rule will match, resulting in duplicated
  // loaders. Therefore it is necessary to perform a dedupe here.
  // Also make sure to dedupe based on loader path and query to be safe.
  // Assumes you'd probably never want to apply the same loader on the same
  // file twice.
  const seen: { [identifier: string]: boolean } = {}
  const loaderStrings: string[] = []
  let hasDuplications: boolean = false

  this.loaders.forEach((loader: any) => {
    const identifier = isString(loader) ? loader : loader.path + loader.query
    const request = isString(loader) ? loader : loader.request

    if (!seen[identifier]) {
      seen[identifier] = true
      // loader.request contains both the resolved loader path and its options
      // query (e.g. ??ref-0)
      loaderStrings.push(request)
    } else {
      hasDuplications = true
    }
  })

  if (hasDuplications) {
    const request: string = stringifyRequest(
      this,
      '-!' +
        [...loaderStrings, this.resourcePath + this.resourceQuery].join('!')
    )

    return `import m from ${request};\nexport default m;\nexport * from ${request};\n`
  }

  return undefined
}
