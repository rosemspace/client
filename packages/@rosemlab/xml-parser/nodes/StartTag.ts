import MatchRange from './MatchRange'
import Attr from './Attr'

export default interface StartTag extends MatchRange {
  [name: string]: any
  attrs: Attr[]
  localName: string
  name: string
  nameLowerCased: string
  namespaceURI?: string
  prefix?: string
  unarySlash: string
  void: boolean
}
