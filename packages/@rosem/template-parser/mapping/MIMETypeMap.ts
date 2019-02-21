import { TemplateSupportedType } from '../TemplateParser'

export type MIMETypeMap = {
  [tagName: string]: TemplateSupportedType
}

export const TEXT_XML_MIME_TYPE = 'text/xml'
export const TEXT_HTML_MIME_TYPE = 'text/html'
export const APPLICATION_XML_MIME_TYPE = 'application/xml'
export const APPLICATION_XHTML_XML_MIME_TYPE = 'application/xhtml+xml'
export const APPLICATION_MATHML_XML_MIME_TYPE = 'application/mathml+xml'
export const IMAGE_SVG_XML_MIME_TYPE = 'image/svg+xml'

export const MIME_TYPE_MAP: MIMETypeMap = {
  xml: TEXT_XML_MIME_TYPE,
  html: TEXT_HTML_MIME_TYPE,
  xhtml: APPLICATION_XHTML_XML_MIME_TYPE,
  math: APPLICATION_MATHML_XML_MIME_TYPE,
  svg: IMAGE_SVG_XML_MIME_TYPE,
}

export default MIMETypeMap
