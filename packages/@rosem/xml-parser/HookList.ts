import { MatchRange, Attr, EndTag, StartTag, Content } from './nodes'

export default interface HookList {
  start(type: string): void

  processingInstruction<T extends Content>(processingInstruction: T): void

  declaration<T extends Content>(declaration: T): void

  startTag<T extends StartTag>(startTag: T): void

  attribute<T extends Attr, U extends StartTag>(attr: T, startTag: U): void

  endTag<T extends EndTag>(endTag: T): void

  text<T extends Content>(text: T): void

  comment<T extends Content>(comment: T): void

  cDataSection<T extends Content>(cDATASection: T): void

  warn(message: string, matchRange: MatchRange): void

  end(): void
}
