import MatchRange from './MatchRange'
import ParsedAttr from './ParsedAttr'

export default interface ParsedStartTag extends MatchRange {
  name: string
  localName: string
  nameLowerCased: string
  prefix?: string
  namespaceURI?: string
  attrs: ParsedAttr[]
  void: boolean
  unarySlash: string
}
