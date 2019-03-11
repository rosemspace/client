export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
export const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML'
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
export const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
export const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'
export const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'

type NamespaceMap = {
  [type: string]: string
}

export const namespaceMap: NamespaceMap = {
  html: HTML_NAMESPACE,
  math: MATHML_NAMESPACE,
  svg: SVG_NAMESPACE,
  xhtml: HTML_NAMESPACE,
  xml: XML_NAMESPACE,
  xlink: XLINK_NAMESPACE,
  xmlns: XMLNS_NAMESPACE,
}

export default namespaceMap
