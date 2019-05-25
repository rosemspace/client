import ParsedContent from './node/ParsedContent'
import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'

export type XMLProcessorMap = { [mimeType: string]: XMLProcessor }

export default interface XMLProcessor {
  parseProcessingInstruction(): ParsedContent | void

  parseDeclaration(): ParsedContent | void

  parseStartTag(): ParsedStartTag | void

  parseEndTag(): ParsedEndTag | void

  parseComment(): ParsedContent | void

  parseCDataSection(): ParsedContent | void

  parseText(): ParsedContent | void

  startsWithInstruction(source: string): boolean

  isVoidElement(startTag: ParsedStartTag): boolean

  tagOpened(startTag: ParsedStartTag): void

  matchingStartTagMissed(endTag: ParsedEndTag): ParsedEndTag | void

  matchingEndTagMissed(startTag: ParsedStartTag): ParsedEndTag | void
}
