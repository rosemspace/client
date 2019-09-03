import MatchRange from './MatchRange'
import { AttrList } from '../nodes'

export default interface StartTag extends MatchRange {
  attrs: AttrList
  localName: string
  name: string
  nameLowerCased: string
  namespaceURI?: string
  prefix?: string
  unarySlash: string
  void: boolean
}
