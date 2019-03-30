import MatchRange from './MatchRange'

export default interface ParsedAttr extends MatchRange {
  name: string
  localName: string
  nameLowerCased: string
  prefix?: string
  namespaceURI?: string
  value: string
}
