import { isProduction } from '@rosemlabs/env-util'
import {
  getCurrentRequest,
  getOptions,
  getRemainingRequest,
} from 'loader-utils'
import postcss, {
  CssSyntaxError as PostCSSSyntaxError,
  Result as PostCSSResult,
  Warning as PostCSSWarning,
} from 'postcss'
import { version } from 'postcss/package.json'
import { RawSourceMap } from 'source-map'
import { loader } from 'webpack'
import CSSSyntaxError from './CSSSyntaxError'
import postCSSScopedCSSPlugin from './postCSSScopedCSSPlugin'
import postCSSTrimPlugin from './postCSSTrimPlugin'
import { getScopeInfo, ScopeOptions } from './scope'
import Warning from './Warning'
import Loader = loader.Loader
import loaderCallback = loader.loaderCallback
import LoaderContext = loader.LoaderContext

export * from './scope'

type loaderCallbackWithMeta = ((
  err: Error | undefined | null,
  content?: string | Buffer,
  sourceMap?: RawSourceMap,
  meta?: any
) => void) &
  loaderCallback

export type ScopedCSSLoaderOptions = {
  sourceMap?: boolean
  ignorePostCSSVersion?: boolean
} & ScopeOptions

export const SCOPE_PREFIX = isProduction ? '_' : '_scope-'

export default (function scopedCSSLoader(
  this: LoaderContext,
  source: string | Buffer,
  sourceMap?: RawSourceMap,
  meta?: any
): string | Buffer | void | undefined {
  const callback: loaderCallbackWithMeta | undefined = this.async()

  if (!callback) {
    return
  }
  // we can get access to another loader options by using an ident set in the
  // request for this loader.
  const options: ScopedCSSLoaderOptions = {
    scopePrefix: SCOPE_PREFIX,
    ...(getOptions(this) || {}),
  }

  const { id: scopeId, type: scopeType } = getScopeInfo(
    this.resourceQuery,
    options
  )

  if (scopeId === '') {
    callback(null, source, sourceMap, meta)

    return
  }

  const useSourceMap: boolean | undefined = options.sourceMap

  // Some loaders (example `"postcss-loader": "1.x.x"`) always generates source
  // map, we should remove it
  // eslint-disable-next-line no-param-reassign
  sourceMap = (useSourceMap && sourceMap) || undefined

  // Reuse CSS AST (PostCSS AST e.g 'postcss-loader') to avoid reparsing
  if (meta) {
    const { ast } = meta

    if (ast && 'postcss' === ast.type) {
      if (options.ignorePostCSSVersion || ast.version === version) {
        // eslint-disable-next-line no-param-reassign
        source = ast.root
      } else {
        throw new TypeError(
          `[@rosemlabs/scoped-css-loader]: PostCSS version of the loader is ` +
            `incompatible with version installed by a user. Please use the ` +
            `following version - ${version} or enable ` +
            `"ignorePostCSSVersion" option of the loader.`
        )
      }
    }
  }

  postcss([
    postCSSTrimPlugin(),
    postCSSScopedCSSPlugin({
      scopeId: `${options.scopePrefix}${scopeId}`,
      scopeType: scopeType,
    }),
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
          `export default ${JSON.stringify(result.css)}`,
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
