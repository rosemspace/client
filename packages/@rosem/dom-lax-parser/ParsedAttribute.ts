import MatchRange from './MatchRange'

export default interface ParsedAttribute extends MatchRange {
  name: string
  nameLowerCased: string
  namespace?: string
  value: string
}
