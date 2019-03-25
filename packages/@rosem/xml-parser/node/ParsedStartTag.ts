import MatchRange from './MatchRange'
import ParsedAttr from './ParsedAttr'

export default interface ParsedStartTag extends MatchRange {
  name: string
  nameLowerCased: string
  namespace?: string
  attrs: ParsedAttr[]
  void: boolean
  unarySlash: string
}
