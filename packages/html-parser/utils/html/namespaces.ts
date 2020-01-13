import { MATHML_NAMESPACE } from '../mathml'
import { SVG_NAMESPACE } from '../svg'

export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

export const HTML_ELEMENT_NAMESPACE_MAP = {
  html: HTML_NAMESPACE,
  math: MATHML_NAMESPACE,
  svg: SVG_NAMESPACE,
}

export { MATHML_NAMESPACE } from '../mathml/syntax'

export { SVG_NAMESPACE } from '../svg/syntax'

export { XLINK_NAMESPACE, XML_NAMESPACE, XMLNS_NAMESPACE } from '../xml/syntax'
