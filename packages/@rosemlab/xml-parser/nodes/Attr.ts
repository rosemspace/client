import { MatchRange, StartTag } from '.'

export default interface Attr extends MatchRange {
  localName: string
  name: string
  nameLowerCased: string
  namespaceURI?: string
  ownerElement: StartTag
  prefix?: string
  value: string
}
