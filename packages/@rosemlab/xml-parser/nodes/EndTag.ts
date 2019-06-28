import MatchRange from './MatchRange'

export default interface EndTag extends MatchRange {
  readonly localName: string
  readonly name: string
  readonly nameLowerCased: string
  readonly prefix?: string
}
