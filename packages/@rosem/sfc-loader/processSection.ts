import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { OptionObject } from 'loader-utils'
import { ParsedUrlQuery } from 'querystring'
import SFCSection from './SFCSection'
import SFCDescriptor from './SFCDescriptor'

export default function processSection(
  loaderContext: LoaderContext,
  descriptor: SFCDescriptor,
  query: ParsedUrlQuery,
  options: OptionObject
): void {
  const section: string = query.section.toString()
  const index: number = query.index ? Number(query.index.toString()) : 0 || 0
  const sfcSection: SFCSection = descriptor[section][index]

  if (sfcSection.attrMap.lang) {
    if (!Boolean(options.ignoreExtension)) {
      loaderContext.resourcePath = `${loaderContext.resourcePath}.${
        sfcSection.attrMap.lang
      }`
    }
  }

  loaderContext.callback(
    null,
    sfcSection.text.content
    // descriptor[query.type][0].map
  )
}
