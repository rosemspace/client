import querystring, { ParsedUrlQuery } from 'querystring'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { getOptions } from 'loader-utils'
import { isProduction } from '@rosemlab/env'
import HTMLParser from '@rosemlab/html-parser'
import { Attr } from '@rosemlab/xml-parser/nodes'
import AssetCodeGen from './codegen/AssetCodeGen'
import ScopeCodeGen from './codegen/ScopeCodeGen'
import VDOMCodeGen from './codegen/VDOMCodeGen'

export const SCOPE_PREFIX = isProduction ? 's' : 'scope-'

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
  scopePrefix: string
  prettify?: boolean
}

const defaultUITemplateLoaderOptions: UITemplateLoaderOptions = {
  scopePrefix: isProduction ? 's' : 'scope-',
}

const htmlParser: HTMLParser = new HTMLParser()
const virtualDOMCodeGen: VDOMCodeGen = new VDOMCodeGen()
const scopeCodeGen: ScopeCodeGen = new ScopeCodeGen()

htmlParser.addModule(scopeCodeGen)
htmlParser.addModule(new AssetCodeGen())
htmlParser.addModule(virtualDOMCodeGen)

export default function(this: LoaderContext, source: string): string | void {
  const options: UITemplateLoaderOptions = {
    scopePrefix: SCOPE_PREFIX,
    ...(getOptions(this) || {}),
  }
  // `.slice(1)` - remove "?" character
  const query: ParsedUrlQuery = querystring.parse(this.resourceQuery.slice(1))
  const scopeId: string | undefined = isArray(query.scopeId)
    ? undefined
    : query.scopeId

  if (null != scopeId) {
    scopeCodeGen.setScopeId(`${options.scopePrefix}${scopeId}`)
  }

  htmlParser.parseFromString(source)

  return `module.exports = function render({ createInstance: h }) {
${virtualDOMCodeGen.getCode(options.prettify)}
}
`
}
