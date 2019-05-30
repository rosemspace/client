import MatchRange from './MatchRange'
import Attr from './Attr'

export default interface StartTag extends MatchRange {
  readonly attrs: Attr[]
  // attrMap: {[name: string]: Attr}
  readonly localName: string
  readonly name: string
  readonly nameLowerCased: string
  readonly namespaceURI?: string
  readonly prefix?: string
  readonly unarySlash: string
  readonly void: boolean
  readonly [name: string]: any
}
