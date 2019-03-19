import MatchRange from './MatchRange'

export default interface ParsedEndTag extends MatchRange {
  name: string
  nameLowerCased: string
}
