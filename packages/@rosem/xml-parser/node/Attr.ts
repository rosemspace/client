import MatchRange from './MatchRange'

export default interface Attr extends MatchRange {
  readonly localName: string
  readonly name: string
  readonly nameLowerCased: string
  readonly namespaceURI?: string
  // readonly ownerElement?: Element
  readonly prefix?: string
  value: string
}
