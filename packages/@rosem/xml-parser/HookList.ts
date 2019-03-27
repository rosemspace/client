import MatchRange from './node/MatchRange'
import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'
import ParsedContent from './node/ParsedContent'
import WarningData from './WarningData'

export type ParsingHook<T extends MatchRange> = <U extends T>(parsedNode: U) => void

export default interface HookList {
  start(type: string): void

  end(): void

  // processingInstruction<T extends ParsedContent>(parsedProcessingInstruction: T): void
  processingInstruction: ParsingHook<ParsedContent>

  // startTag<T extends ParsedStartTag>(parsedTag: T): void
  startTag: ParsingHook<ParsedStartTag>

  // endTag<T extends ParsedEndTag>(parsedEndTag: T): void
  endTag: ParsingHook<ParsedEndTag>

  // text<T extends ParsedContent>(parsedText: T): void
  text: ParsingHook<ParsedContent>

  // comment<T extends ParsedContent>(parsedComment: T): void
  comment: ParsingHook<ParsedContent>

  // cDataSection<T extends ParsedContent>(parsedCDATASection: T): void
  cDataSection: ParsingHook<ParsedContent>

  warn(message: string, data: WarningData): void
}
