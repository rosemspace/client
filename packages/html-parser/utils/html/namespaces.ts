import { MATHML_NAMESPACE } from '../mathml'
import { SVG_NAMESPACE } from '../svg'

export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

export const HTML_ELEMENTS_ADJUSTMENT_MAP = Object.freeze({
  html: HTML_NAMESPACE,
  math: MATHML_NAMESPACE,
  svg: SVG_NAMESPACE,
})

export { MATHML_NAMESPACE } from '../mathml'

export { SVG_NAMESPACE } from '../svg'

export * from '../xml/namespaces'
