import { isProduction } from '@rosemlabs/env-util'
import HTMLParser from '@rosemlabs/html-parser-old'
import { Attr } from '@rosemlabs/html-parser-old/nodes'
import { getScopeInfo, ScopeOptions } from '@rosemlabs/scoped-css-loader'
import { getOptions } from 'loader-utils'
import { format } from 'prettier'
import { loader } from 'webpack'
import AssetCodeGen from './codegen/AssetCodeGen'
import ScopeCodeGen from './codegen/ScopeCodeGen'
import VDOMCodeGen from './codegen/VDOMCodeGen'
import LoaderContext = loader.LoaderContext

export const SCOPE_PREFIX = isProduction ? '_' : '_scope-'

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
  keepCodeUgly?: boolean
} & ScopeOptions

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
  const { id: scopeId, type: scopeType } = getScopeInfo(
    this.resourceQuery,
    options
  )

  if (scopeId !== '') {
    scopeCodeGen.setScope(`${options.scopePrefix}${scopeId}`, scopeType)
  }

  htmlParser.parseFromString(source)

  const code: string =
    'export default function render({ createInstance: h })' +
    `{${virtualDOMCodeGen.getCode()}}`

  try {
    return options.keepCodeUgly || isProduction ? code : format(code)
  } catch {
    throw new Error(
      'You need "prettier" module to be installed to prettify generated ' +
        'javascript code of virtual DOM'
    )
  }
}
