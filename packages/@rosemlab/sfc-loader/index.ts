import { relative } from 'path'
import querystring, { ParsedUrlQuery } from 'querystring'
import { loader, RuleSetUse } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils from 'loader-utils'
import SFCDescriptor from './SFCDescriptor'
import SFCParser from './SFCParser'
import processBlock from './processBlock'
import generateBlocksCode from './codegen/generateBlocksCode'

export type SFCLoaderOptions = {
  sourceMap?: boolean
  noPad?: boolean
  exportName?: string
  //todo
  extendRule?: {
    match: string,
    use: RuleSetUse
  }
}

export const SFC_KEYWORD = 'sfc'
export const SFC_LOADER_IDENT = `${SFC_KEYWORD}-loader`

const sfcParser = new SFCParser()

export default function sfcLoader(
  this: LoaderContext,
  source: string
): string | void {
  const options: SFCLoaderOptions = loaderUtils.getOptions(this) || {}
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
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
    const blockName: string = query.block.toString()
    const index: number = query.index ? Number(query.index.toString()) : 0 || 0

    return processBlock(this, sfcDescriptor[blockName][index], query, options)
  }

  return generateBlocksCode(this, sfcDescriptor, options.exportName)
}
