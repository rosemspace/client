import { basename } from 'path'
import qs, { ParsedUrlQuery } from 'querystring'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils, { OptionObject } from 'loader-utils'
import SFCDescriptor from './SFCDescriptor'
import SFCParser from './SFCParser'
import processBlock from './processBlock'
import generateBlocksCode from './codegen/generateBlocksCode'

export const SFC_KEYWORD = 'sfc'

const sfcParser = new SFCParser()

export default function(this: LoaderContext, source: string): string | void {
  const sfcDescriptor: SFCDescriptor = sfcParser.parseFromString(
    source,
    basename(this.resourcePath)
  )
  const loaderContext: LoaderContext = this
  // const stringifyRequest = (resource: string) => loaderUtils.stringifyRequest(loaderContext, resource)
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = qs.parse(loaderContext.resourceQuery.slice(1))
  const options: OptionObject = loaderUtils.getOptions(loaderContext) || {}

  // We have block in the query like template, script, style etc
  if (query.block) {
    return processBlock(loaderContext, sfcDescriptor, query, options)
  }

  return generateBlocksCode(loaderContext, sfcDescriptor)
}
