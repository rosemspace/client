export const IMAGE_SVG_XML_MIME_TYPE = 'image/svg+xml'
export const APPLICATION_MATHML_XML_MIME_TYPE = 'application/mathml+xml'
export const APPLICATION_XHTML_XML_MIME_TYPE = 'application/xhtml+xml'
export const APPLICATION_XML_MIME_TYPE = 'application/xml'
export const TEXT_HTML_MIME_TYPE = 'text/html'

export type SourceSupportedType =
  | 'application/mathml+xml'
  | 'text/html'
  | 'application/xml'
  | 'application/xhtml+xml'
  | 'image/svg+xml'

type TypeMap = {
  [tagName: string]: SourceSupportedType
}

export const typeMap: TypeMap = {
  html: TEXT_HTML_MIME_TYPE,
  math: APPLICATION_MATHML_XML_MIME_TYPE,
  svg: IMAGE_SVG_XML_MIME_TYPE,
  xhtml: APPLICATION_XHTML_XML_MIME_TYPE,
  xml: APPLICATION_XML_MIME_TYPE,
}

export default typeMap
