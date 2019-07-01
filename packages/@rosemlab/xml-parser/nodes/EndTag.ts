import MatchRange from './MatchRange'

export default interface EndTag extends MatchRange {
  localName: string
  name: string
  nameLowerCased: string
  prefix?: string
}
