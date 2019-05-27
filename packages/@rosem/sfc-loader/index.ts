import HTMLParser from '@rosem/html-parser'
import generateSectionsCode
  from '@rosem/sfc-loader/codegen/generateSectionsCode'
import processSection from '@rosem/sfc-loader/processSection'
import { qualifiedNameRegExp } from '@rosem/xml-syntax'
import qs, { ParsedUrlQuery } from 'querystring'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils, { OptionObject } from 'loader-utils'
import SFCSection from './SFCSection'
import SFCDescriptor from './SFCDescriptor'
import Compiler from './Compiler'

const htmlParser = new HTMLParser({
  rawTextElement: new RegExp(qualifiedNameRegExp.source, 'i'),
})
const sfcCompiler = new Compiler()

htmlParser.addModule(sfcCompiler)

export default function(this: LoaderContext, source: string): string | void {
  htmlParser.parseFromString(source)

  const sfcDescriptor: SFCDescriptor = sfcCompiler.getSFCDescriptor()
  const loaderContext: LoaderContext = this
  // const stringifyRequest = (resource: string) => loaderUtils.stringifyRequest(loaderContext, resource)
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = qs.parse(loaderContext.resourceQuery.slice(1))
  const options: OptionObject = loaderUtils.getOptions(loaderContext) || {}

  // We have section in the query like template, script, style etc
  if (query.section) {
    return processSection(
      loaderContext,
      sfcDescriptor,
      query,
      options
    )
  }

  const code = generateSectionsCode(loaderContext, sfcDescriptor, )

  return `export default ${JSON.stringify(sfcDescriptor)}`
}
