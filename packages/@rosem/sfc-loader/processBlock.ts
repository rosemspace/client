import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { OptionObject } from 'loader-utils'
import { ParsedUrlQuery } from 'querystring'
import SFCBlock from './SFCBlock'
import SFCDescriptor from './SFCDescriptor'

export default function processBlock(
  loaderContext: LoaderContext,
  descriptor: SFCDescriptor,
  query: ParsedUrlQuery,
  options: OptionObject
): void {
  const blockName: string = query.block.toString()
  const index: number = query.index ? Number(query.index.toString()) : 0 || 0
  const block: SFCBlock = descriptor[blockName][index]

  // if (query.lang) {
  //   if (!Boolean(options.ignoreExtension)) {
  //     loaderContext.resourcePath = `${loaderContext.resourcePath}.${
  //       query.lang
  //     }`
  //   }
  // }

  loaderContext.callback(
    null,
    block.content,
    block.map
  )
}
