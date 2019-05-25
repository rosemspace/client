import MatchRange from './MatchRange'

export default interface EndTag extends MatchRange {
  name: string
  prefix?: string
  localName: string
  nameLowerCased: string
}
