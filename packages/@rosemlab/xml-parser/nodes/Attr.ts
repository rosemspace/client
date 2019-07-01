import MatchRange from './MatchRange'

export default interface Attr extends MatchRange {
  localName: string
  name: string
  nameLowerCased: string
  namespaceURI?: string
  // ownerElement?: Element
  prefix?: string
  value: string
}
