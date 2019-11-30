import { MatchRange, Element } from '.'

export type AttrMap<T = string | number | boolean> = {
  [camelCaseName: string]: T
}

export type AttrList<T = string | number | boolean> = Attr[] & AttrMap<T>

export default interface Attr extends MatchRange {
  localName: string
  name: string
  nameLowerCased: string
  namespaceURI?: string
  ownerElement: Element
  prefix?: string
  value: string
}
