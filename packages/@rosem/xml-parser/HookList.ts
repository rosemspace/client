import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'
import ParsedContent from './node/ParsedContent'
import WarningData from './WarningData'

export default interface HookList {
  start(type: string): void

  end(): void

  warn(message: string, data: WarningData): void

  processingInstruction<T extends ParsedContent>(
    parsedProcessingInstruction: T
  ): void

  startTag<T extends ParsedStartTag>(parsedStartTag: T): void

  endTag<T extends ParsedEndTag>(parsedEndTag: T): void

  text<T extends ParsedContent>(parsedText: T): void

  comment<T extends ParsedContent>(parsedComment: T): void

  cDataSection<T extends ParsedContent>(parsedCDATASection: T): void
}
