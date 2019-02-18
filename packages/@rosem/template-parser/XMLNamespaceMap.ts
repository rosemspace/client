export type XMLNamespaceMap = {
  [type: string]: string
}

export const ELEMENT_NAMESPACE_MAP: XMLNamespaceMap = {
  HTML: 'http://www.w3.org/1999/xhtml',
  MATH: 'http://www.w3.org/1998/Math/MathML',
  SVG: 'http://www.w3.org/2000/svg',
  XHTML: 'http://www.w3.org/1999/xhtml',
  XML: 'http://www.w3.org/XML/1998/namespace',
}

export const ATTRIBUTE_NAMESPACE_MAP: XMLNamespaceMap = {
  xlink: 'http://www.w3.org/1999/xlink',
  xmlns: 'http://www.w3.org/2000/xmlns/',
}

export default XMLNamespaceMap
