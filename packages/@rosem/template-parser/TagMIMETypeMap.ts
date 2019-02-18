import { TemplateSupportedType } from './TemplateParser'

export type TagMIMETypeMap = {
  [tagName: string]: TemplateSupportedType
}

export const TAG_MIME_TYPE_MAP: TagMIMETypeMap = {
  HTML: 'text/html',
  MATH: 'application/mathml+xml',
  SVG: 'image/svg+xml',
  XHTML: 'application/xhtml+xml',
  XML: 'text/xml',
}

export default TagMIMETypeMap
