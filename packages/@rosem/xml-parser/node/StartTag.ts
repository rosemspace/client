import MatchRange from './MatchRange'
import Attr from './Attr'

export default interface StartTag extends MatchRange {
  name: string
  localName: string
  nameLowerCased: string
  prefix?: string
  namespaceURI?: string
  attrs: Attr[]
  void: boolean
  unarySlash: string
}
