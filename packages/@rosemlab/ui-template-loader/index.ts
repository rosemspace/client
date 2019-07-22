import { Attr } from '@rosemlab/xml-parser/nodes'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import generateVirtualDOMCode from './codegen/generateVirtualDOMCode'

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

export default function(this: LoaderContext, source: string): string | void {
  return `export default function render({ createInstance: h }) {
  return ${generateVirtualDOMCode(source)}
}
`
}
