import MatchRange from '@rosem/xml-parser/node/MatchRange'
import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'
import ParsedContent from './node/ParsedContent'

export default interface HookList {
  start(type: string): void

  end(): void

  warn(message: string, matchRange: MatchRange): void

  processingInstruction<T extends ParsedContent>(
    parsedProcessingInstruction: T
  ): void

  declaration<T extends ParsedContent>(declaration: T): void

  startTag<T extends ParsedStartTag>(parsedStartTag: T): void

  endTag<T extends ParsedEndTag>(parsedEndTag: T): void

  text<T extends ParsedContent>(parsedText: T): void

  comment<T extends ParsedContent>(parsedComment: T): void

  cDataSection<T extends ParsedContent>(parsedCDATASection: T): void
}
