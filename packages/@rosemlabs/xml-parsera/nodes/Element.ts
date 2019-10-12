import MatchRange from './MatchRange'
import { AttrList } from '../nodes'

export default interface Element extends MatchRange {
  attrs: AttrList
  // lang: string
  localName: string
  name: string
  nameLowerCased: string
  namespaceURI?: string
  prefix?: string
  unarySlash: string
  void: boolean
}
