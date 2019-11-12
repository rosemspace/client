import { MatchRange, Attr, EndTag, StartTag, Content } from './nodes'

export default interface HookList {
  start(mimeType: string): void

  // xmlDeclaration<T extends Content>(declaration: T): void

  declaration<T extends Content>(declaration: T): void

  processingInstruction<T extends Content>(processingInstruction: T): void

  startTag<T extends StartTag>(startTag: T): void

  attribute<T extends Attr>(attr: T): void

  endTag<T extends EndTag>(endTag: T): void

  text<T extends Content>(text: T): void

  comment<T extends Content>(comment: T): void

  cDataSection<T extends Content>(cDATASection: T): void

  warn(message: string, matchRange: MatchRange): void

  end(): void
}
