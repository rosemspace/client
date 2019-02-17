export type XmlNamespaceMap = {
  [type: string]: string
}

export const elementDefaultNamespaceMap: XmlNamespaceMap = {
  html: 'http://www.w3.org/1999/xhtml',
  svg: 'http://www.w3.org/2000/svg',
}

export const attributeDefaultNamespaceMap: XmlNamespaceMap = {
  xlink: 'http://www.w3.org/1999/xlink',
}
