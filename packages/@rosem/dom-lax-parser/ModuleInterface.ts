import { WarningData } from './DOMLaxParser'
import ParsedEndTag from './ParsedEndTag'
import ParsedStartTag from './ParsedStartTag'
import ParsedTextContent from './ParsedTextContent'

export default interface ModuleInterface {
  tagStart(parsedTag: ParsedStartTag): void

  tagEnd(parsedEndTag: ParsedEndTag): void

  text(parsedText: ParsedTextContent): void

  comment(parsedComment: ParsedTextContent): void

  cDataSection(parsedCDATASection: ParsedTextContent): void

  warn(message: string, data: WarningData): void
}
