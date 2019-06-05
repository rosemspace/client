import { relative } from 'path'
import qs, { ParsedUrlQuery } from 'querystring'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils, { OptionObject } from 'loader-utils'
import SFCDescriptor from './SFCDescriptor'
import SFCParser from './SFCParser'
import processBlock from './processBlock'
import generateBlocksCode from './codegen/generateBlocksCode'

export const SFC_KEYWORD = 'sfc'
export const SFC_LOADER_IDENT = `${SFC_KEYWORD}-loader`

const sfcParser = new SFCParser()

export default function(this: LoaderContext, source: string): string | void {
  const options: OptionObject = loaderUtils.getOptions(this) || {}
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = qs.parse(this.resourceQuery.slice(1))
  const sfcDescriptor: SFCDescriptor = sfcParser.parseFromString(
    source,
    relative(this.rootContext || process.cwd(), this.resourcePath),
    {
      sourceMap: options.sourceMap,
      noPad: options.noPad,
    }
  )

  // We have block in the query like template, script, style etc
  if (query.block) {
    return processBlock(this, sfcDescriptor, query, options)
  }

  return generateBlocksCode(this, sfcDescriptor)
}
