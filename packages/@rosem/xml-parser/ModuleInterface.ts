import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'
import ParsedContent from './node/ParsedContent'
import WarningData from './WarningData'

export default interface ModuleInterface {
  start(type: string): void

  end(): void

  processingInstruction(parsedProcessingInstruction: ParsedContent): void

  startTag(parsedTag: ParsedStartTag): void

  endTag(parsedEndTag: ParsedEndTag): void

  text(parsedText: ParsedContent): void

  comment(parsedComment: ParsedContent): void

  cDataSection(parsedCDATASection: ParsedContent): void

  warn(message: string, data: WarningData): void
}
