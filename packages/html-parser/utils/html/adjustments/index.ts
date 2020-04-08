import {
  XLINK_NAMESPACE,
  XML_NAMESPACE,
  XMLNS_NAMESPACE,
} from '../../infra/namespaces'
import svgAdjustedAttributeMap from './svgAdjustedAttributeMap.json'
import svgAdjustedElementMap from './svgAdjustedElementMap.json'

// https://html.spec.whatwg.org/multipage/parsing.html#adjust-foreign-attributes
export const HTML_ADJUSTED_FOREIGN_ATTRIBUTES_MAP = {
  'xlink:actuate': XLINK_NAMESPACE,
  'xlink:arcrole': XLINK_NAMESPACE,
  'xlink:href': XLINK_NAMESPACE,
  'xlink:role': XLINK_NAMESPACE,
  'xlink:show': XLINK_NAMESPACE,
  'xlink:title': XLINK_NAMESPACE,
  'xlink:type': XLINK_NAMESPACE,
  'xml:base': XML_NAMESPACE,
  'xml:lang': XML_NAMESPACE,
  'xml:space': XML_NAMESPACE,
  xmlns: XMLNS_NAMESPACE,
  'xmlns:xlink': XMLNS_NAMESPACE,
}

export const XML_ADJUSTED_ATTRIBUTES_MAP = {
  xlink: XLINK_NAMESPACE,
  xml: XML_NAMESPACE,
  xmlns: XMLNS_NAMESPACE,
}

export function adjustName(map: Record<string, string>, name: string): string {
  name = name.toLocaleLowerCase()

  return map[name] ?? name
}

// https://html.spec.whatwg.org/multipage/parsing.html#adjust-svg-attributes
export const SVG_ADJUSTED_ATTRIBUTE_MAP = svgAdjustedAttributeMap

export function adjustSVGAttribute(name: string): string {
  return adjustName(SVG_ADJUSTED_ATTRIBUTE_MAP, name)
}

// https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
export const SVG_ADJUSTED_ELEMENT_MAP = svgAdjustedElementMap

export function adjustSVGElement(name: string): string {
  return adjustName(SVG_ADJUSTED_ELEMENT_MAP, name)
}

/**
 * Normalize a MathML attribute name to its proper case and form.
 * Note, all MathML element names are lowercase.
 * https://html.spec.whatwg.org/multipage/parsing.html#adjust-mathml-attributes
 */
export function adjustMathMLAttribute(name: string): string {
  name = name.toLowerCase()

  // Only one attribute has a mixed case form for MathML.
  return 'definitionurl' === name ? 'definitionURL' : name
}
