import { XLINK_NAMESPACE, XML_NAMESPACE, XMLNS_NAMESPACE } from './syntax'

// // https://html.spec.whatwg.org/multipage/parsing.html#adjust-foreign-attributes
export const XML_ATTRS_ADJUSTMENT_MAP = {
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
