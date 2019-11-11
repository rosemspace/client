export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
export const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML'
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
export const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'
export const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
export const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'

export const XML_DEFAULT_NAMESPACE_MAP = {
  xml: XML_NAMESPACE,
  xmlns: XMLNS_NAMESPACE,
}

export const SVG_DEFAULT_NAMESPACE_MAP = {
  ...XML_DEFAULT_NAMESPACE_MAP,
  svg: SVG_NAMESPACE,
  xlink: XLINK_NAMESPACE,
}

export const HTML_DEFAULT_NAMESPACE_MAP = {
  ...SVG_DEFAULT_NAMESPACE_MAP,
  html: HTML_NAMESPACE,
  math: MATHML_NAMESPACE,
}
