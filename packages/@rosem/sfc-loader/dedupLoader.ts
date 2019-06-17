import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils from 'loader-utils'
import querystring, { ParsedUrlQuery } from 'querystring'
import { SFCLoaderPluginOptions } from './SFCLoaderPlugin'
import { SFC_LOADER_IDENT } from '.'

function isDedupLoader(loader: any): boolean {
  return loader.path !== __filename
}

function isCacheLoader(loader: any): boolean {
  return /[/\\@]cache-loader/.test(loader.path)
}

// const selfPath = require.resolve('../index')

const shouldIgnoreCustomBlock = (loaders: any[]) => {
  const actualLoaders = loaders.filter((loader) => {
    if (isDedupLoader(loader)) {
      return false
    }
    // sfc-loader
    // if (loader.path === selfPath) {
    //   return false
    // }

    // cache-loader
    if (isCacheLoader(loader)) {
      return false
    }

    return true
  })

  return 0 === actualLoaders.length
}

const stringifyRequest = loaderUtils.stringifyRequest

export function generateRequest(loaderContext: LoaderContext): string | void {
  // Important: dedupe since both the original rule
  // and the cloned rule would match a source import request.
  // also make sure to dedupe based on loader path.
  // assumes you'd probably never want to apply the same loader on the same
  // file twice.
  // Exception: in Vue CLI we do need two instances of postcss-loader
  // for user config and inline minification. So we need to dedupe baesd on
  // path AND query to be safe.
  const seen: any = {}
  const loaderStrings: string[] = []
  let hasDuplications: boolean = false

  loaderContext.loaders.forEach((loader: any) => {
    // if (isDedupLoader(loader)) {
    // return
    // }

    const identifier =
      typeof loader === 'string' ? loader : loader.path + loader.query
    const request = typeof loader === 'string' ? loader : loader.request

    if (!seen[identifier]) {
      seen[identifier] = true
      // loader.request contains both the resolved loader path and its options
      // query (e.g. ??ref-0)
      loaderStrings.push(request)
    } else {
      hasDuplications = true
      // loaderStrings.push(request)
      // resource += `-!${request}`
    }
  })

  return hasDuplications
    ? stringifyRequest(
        loaderContext,
        '-!' +
          [
            ...loaderStrings,
            loaderContext.resourcePath + loaderContext.resourceQuery,
          ].join('!')
      )
    : undefined
}

export default function(source: string): string {
  return source
}

export function pitch(
  this: LoaderContext,
  remainingRequest: any,
  precedingRequest: any,
  data: any
) {
  const pluginOptions: SFCLoaderPluginOptions = (this as any)[SFC_LOADER_IDENT]
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
  const block: string = query.block as string

  // console.log('\n', remainingRequest, '\n', precedingRequest, '\n', this.loaders.map((loader: any, index: number): void => {
  //   console.log(index, '-', loader.request, '\n');
  //   return loader
  // }), '\n');
  if (null == pluginOptions.blockLangMap[block]) {
  }

  // if a custom block has no other matching loader other than vue-loader itself
  // or cache-loader, we should ignore it
  // if (
  //   null == pluginOptions.blockLangMap[block] &&
  //   shouldIgnoreCustomBlock(this.loaders)
  // ) {
  //   return ''
  // }

  // console.log('\nREQUEST: ', remainingRequest, '\n', precedingRequest, '\n');
  // When the user defines a rule that has only resourceQuery but no test,
  // both that rule and the cloned rule will match, resulting in duplicated
  // loaders. Therefore it is necessary to perform a dedupe here.
  const request = generateRequest(this)

  if (request) {
    console.log(this.loaders)
    console.log('\n', request, '\n')

    // remainingRequest = 'D:\\Code\\rosem\\client\\node_modules\\json-loader\\index.js!D:\\Code\\rosem\\client\\packages\\@rosem\\client\\packages\\@rosem\\sfc-loader\\index.ts!D:\\Code\\rosem\\client\\packages\\@rosem\\app\\App.sfc?sfc&block=i18n&index=0'

    return `import m from ${request};\nexport default m;\nexport * from ${request};\n`
  }
}
