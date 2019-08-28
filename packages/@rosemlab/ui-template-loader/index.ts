import { Attr } from '@rosemlab/xml-parser/nodes'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import loaderUtils from 'loader-utils'
import generateVirtualDOMCode from './generateVirtualDOMCode'

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

export default function(this: LoaderContext, source: string): string | void {
  const options: UITemplateLoaderOptions = loaderUtils.getOptions(this) || {}

  return `export default function render({ createInstance: h }) {
${generateVirtualDOMCode(source, options.prettify)}
}
`
}
