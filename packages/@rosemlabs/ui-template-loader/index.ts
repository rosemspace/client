import { isProduction } from '@rosemlabs/env-util'
import HTMLParser from '@rosemlabs/html-parser'
import { Attr } from '@rosemlabs/xml-parser/nodes'
import { getOptions } from 'loader-utils'
import { format } from 'prettier'
import querystring, { ParsedUrlQuery } from 'querystring'
import { loader } from 'webpack'
import AssetCodeGen from './codegen/AssetCodeGen'
import ScopeCodeGen from './codegen/ScopeCodeGen'
import VDOMCodeGen from './codegen/VDOMCodeGen'
import LoaderContext = loader.LoaderContext

export const SCOPE_PREFIX = isProduction ? '_' : '_scope-'

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
    attr.name.startsWith(ATTR_SYNTAX_KEYWORDS[syntax].shorthand) ||
    ATTR_SYNTAX_KEYWORDS[syntax].fullName === attr.prefix
  )
}

export type UITemplateLoaderOptions = {
  scopePrefix: string
  scopeType?: ScopeType
  keepCodeUgly?: boolean
}

export type ScopeType = 'class' | 'attr'

const htmlParser: HTMLParser = new HTMLParser()
const scopeCodeGen: ScopeCodeGen = new ScopeCodeGen()
const assetCodeGen: AssetCodeGen = new AssetCodeGen()
const virtualDOMCodeGen: VDOMCodeGen = new VDOMCodeGen()

htmlParser.addModule(scopeCodeGen)
htmlParser.addModule(assetCodeGen)
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
    scopeCodeGen.setScope(`${options.scopePrefix}${scopeId}`, options.scopeType)
  }

  htmlParser.parseFromString(source)

  const code: string = `export default function render({ createInstance: h }) {
${virtualDOMCodeGen.getCode()}}`

  try {
    return options.keepCodeUgly || isProduction ? code : format(code)
  } catch {
    throw new Error(
      'You need "prettier" module to be installed to prettify generated ' +
        'javascript code of virtual DOM'
    )
  }
}
