import querystring, { ParsedUrlQuery } from 'querystring'
import { RawSourceMap } from 'source-map'
import { loader } from 'webpack'
import Loader = loader.Loader
import LoaderContext = loader.LoaderContext
import loaderCallback = loader.loaderCallback
import {
  getOptions,
  getRemainingRequest,
  getCurrentRequest,
} from 'loader-utils'
import postcss, {
  Result as PostCSSResult,
  Warning as PostCSSWarning,
  CssSyntaxError as PostCSSSyntaxError,
  ResultMessage,
} from 'postcss'
import { version } from 'postcss/package.json'
import { isProduction } from '@rosemlabs/env'
import postCSSScopedCSSPlugin from './postCSSScopedCSSPlugin'
import Warning from './Warning'
import CSSSyntaxError from './CSSSyntaxError'

const isArray = Array.isArray

type loaderCallbackWithMeta = ((
  err: Error | undefined | null,
  content?: string | Buffer,
  sourceMap?: RawSourceMap,
  meta?: any
) => void) &
  loaderCallback

export type ScopedCSSLoaderOptions = {
  scopePrefix?: string
  sourceMap?: boolean
  useStrictPostCSSVersion?: boolean
}

export const SCOPE_PREFIX = isProduction ? '_' : '_scope-'

export default (function scopedCSSloader(
  this: LoaderContext,
  source: string | Buffer,
  sourceMap?: RawSourceMap,
  meta?: any
): string | Buffer | void | undefined {
  const callback: loaderCallbackWithMeta | undefined = this.async()

  if (!callback) {
    return
  }

  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
  const scopeId: string | undefined = isArray(query.scopeId)
    ? undefined
    : query.scopeId

  if (null == scopeId) {
    callback(null, source, sourceMap, meta)

    return
  }

  // we can get access to another loader options by using an ident set in the
  // request for this loader.
  const options: ScopedCSSLoaderOptions = {
    scopePrefix: SCOPE_PREFIX,
    ...(getOptions(this) || {}),
  }
  const useSourceMap: boolean | undefined = options.sourceMap

  // Some loaders (example `"postcss-loader": "1.x.x"`) always generates source
  // map, we should remove it
  // eslint-disable-next-line no-param-reassign
  sourceMap = (useSourceMap && sourceMap) || undefined

  // Reuse CSS AST (PostCSS AST e.g 'postcss-loader') to avoid reparsing
  if (meta) {
    const { ast } = meta

    if (
      ast &&
      'postcss' === ast.type &&
      (!options.useStrictPostCSSVersion || ast.version === version)
    ) {
      // eslint-disable-next-line no-param-reassign
      source = ast.root
    }
  }

  postcss([
    postCSSScopedCSSPlugin({ scopeId: `${options.scopePrefix}${scopeId}` }),
  ])
    .process(source, {
      from: getRemainingRequest(this)
        .split('!')
        .pop(),
      to: getCurrentRequest(this)
        .split('!')
        .pop(),
      map: useSourceMap
        ? {
            prev: sourceMap,
            inline: false,
            annotation: false,
          }
        : undefined,
    })
    .then((result: PostCSSResult): void => {
      result.warnings().forEach((warning: PostCSSWarning): void => {
        this.emitWarning(new Warning(warning))
      })

      if (this.loaderIndex === 0) {
        callback(
          null,
          `module.exports = ${JSON.stringify(result.css)}`,
          sourceMap
        )

        return
      }

      callback(null, result.css, sourceMap, meta)
    })
    .catch((error: PostCSSSyntaxError | Error): void => {
      callback(
        'CssSyntaxError' === error.name
          ? new CSSSyntaxError(error as PostCSSSyntaxError)
          : error
      )
    })
} as Loader)
