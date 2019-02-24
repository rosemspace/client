import {
  ParsedEndTag,
  ParsedStartTag,
  ParsedText,
  WarningData,
} from './DOMLaxParser'

export default interface ModuleInterface {
  tagStart(parsedTag: ParsedStartTag): void

  tagEnd(parsedEndTag: ParsedEndTag): void

  text(parsedText: ParsedText): void

  comment(parsedComment: ParsedText): void

  cDataSection(parsedCDATASection: ParsedText): void

  warn(message: string, data: WarningData): void
}
