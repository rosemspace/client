import MatchRange from './MatchRange'

export default interface ParsedAttr extends MatchRange {
  name: string
  nameLowerCased: string
  namespace?: string
  value: string
}
