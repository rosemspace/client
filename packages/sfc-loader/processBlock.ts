import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { OptionObject } from 'loader-utils'
import { ParsedUrlQuery } from 'querystring'
import SFCBlock from './SFCBlock'

export default function processBlock(
  loaderContext: LoaderContext,
  block: SFCBlock,
  query: ParsedUrlQuery,
  options: OptionObject
): void {
  // if (query.lang) {
  //   if (!Boolean(options.ignoreExtension)) {
  //     loaderContext.resourcePath = `${loaderContext.resourcePath}.${
  //       query.lang
  //     }`
  //   }
  // }

  loaderContext.callback(
    null,
    block.data,
    block.map
  )
}
