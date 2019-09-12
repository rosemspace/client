import { relative } from 'path'
import querystring, { ParsedUrlQuery } from 'querystring'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { getOptions } from 'loader-utils'
import { ScopedCSSLoaderOptions } from '@rosemlab/scoped-css-loader'
import SFCDescriptor from './SFCDescriptor'
import SFCParser, { SFCParserOptions } from './SFCParser'
import processBlock from './processBlock'
import generateBlocksCode from './codegen/generateBlocksCode'

const isArray = Array.isArray

export const SFC_KEYWORD = 'sfc'
export const SFC_LOADER_IDENT = `${SFC_KEYWORD}-loader`

export type SFCLoaderOptions = {
  exportName?: string
  //todo
  injectBefore?: {
    [name: string]: Function
  }
  cacheDirectory?: string
  cacheIdentifier?: string
} & SFCParserOptions & ScopedCSSLoaderOptions

const sfcParser = new SFCParser()

export default function sfcLoader(
  this: LoaderContext,
  source: string
): string | void {
  const options: SFCLoaderOptions = {
    ...(getOptions(this) || {}),
  }
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
  const sfcDescriptor: SFCDescriptor = sfcParser.parseFromString(
    source,
    relative(this.rootContext || process.cwd(), this.resourcePath),
    {
      sourceMap: options.sourceMap,
      noPad: options.noPad,
      noCache: options.noCache,
    }
  )

  // We have block in the query like template, script, style etc
  if (query.block) {
    const blockName: string = query.block.toString()
    const index: number = query.index
      ? parseInt(isArray(query.index) ? query.index[0] : query.index)
      : 0 || 0

    return processBlock(this, sfcDescriptor[blockName][index], query, options)
  }

  return generateBlocksCode(this, sfcDescriptor, options.exportName)
}
