import HookList from './HookList'
import {
  MatchRange,
  StartTag,
  Attr,
  Content,
  EndTag,
} from './nodes'

export default abstract class Module implements HookList {
  attribute<T extends Attr, U extends StartTag>(attr: T, startTag: U): void {}

  cDataSection<T extends Content>(cDATASection: T): void {}

  comment<T extends Content>(comment: T): void {}

  declaration<T extends Content>(declaration: T): void {}

  end(): void {}

  endTag<T extends EndTag>(endTag: T): void {}

  processingInstruction<T extends Content>(processingInstruction: T): void {}

  start(type: string): void {}

  startTag<T extends StartTag>(startTag: T): void {}

  text<T extends Content>(text: T): void {}

  warn(message: string, matchRange: MatchRange): void {}
}
