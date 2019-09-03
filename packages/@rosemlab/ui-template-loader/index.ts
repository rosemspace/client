import querystring, { ParsedUrlQuery } from 'querystring'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils from 'loader-utils'
import HTMLParser from '@rosemlab/html-parser'
import { Attr } from '@rosemlab/xml-parser/nodes'
import AssetCodeGen from './codegen/AssetCodeGen'
import ScopedCSSClassCodeGen from './codegen/ScopedCSSClassCodeGen'
import VDOMCodeGen from './codegen/VDOMCodeGen'

const isArray = Array.isArray

export const ATTR_NAMESPACE_PREFIX = 'x-'

export const ATTR_SYNTAX_KEYWORDS = {
  bind: {
    fullName: `${ATTR_NAMESPACE_PREFIX}bind`,
    shorthand: ':',
  },
}

export function isSyntaxAttr<T extends Attr>(attr: T, syntax: 'bind'): boolean {
  return (
    attr.nameLowerCased.startsWith(ATTR_SYNTAX_KEYWORDS[syntax].shorthand) ||
    ATTR_SYNTAX_KEYWORDS[syntax].fullName === attr.prefix
  )
}
export type UITemplateLoaderOptions = {
  prettify?: boolean
}

const htmlParser: HTMLParser = new HTMLParser()
const virtualDOMCodeGen: VDOMCodeGen = new VDOMCodeGen()
const scopedCSSClassCodeGen: ScopedCSSClassCodeGen = new ScopedCSSClassCodeGen()

htmlParser.addModule(scopedCSSClassCodeGen)
htmlParser.addModule(new AssetCodeGen())
htmlParser.addModule(virtualDOMCodeGen)

export default function(this: LoaderContext, source: string): string | void {
  const options: UITemplateLoaderOptions = loaderUtils.getOptions(this) || {}
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
  const scopeId: string | undefined = isArray(query.scopeId)
    ? undefined
    : query.scopeId

  if (null != scopeId) {
    scopedCSSClassCodeGen.setScopeId(scopeId)
  }

  htmlParser.parseFromString(source)

  return `module.exports = function render({ createInstance: h }) {
${virtualDOMCodeGen.getCode(options.prettify)}
}
`
}
