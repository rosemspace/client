import HookList from './HookList'
import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'

export type ProcessorMap = { [mimeType: string]: Processor }

export default interface Processor extends HookList {
  isForeignElement(tagName: string): boolean

  isVoidElement(parsedStartTag: ParsedStartTag): boolean

  startsWithInstruction(source: string): boolean

  // matchingStartTagFound(startTag: ParsedStartTag): void

  matchingStartTagMissed(endTag: ParsedEndTag): ParsedEndTag | void

  // matchingEndTagFound(endTag: ParsedEndTag): void

  matchingEndTagMissed(startTag: ParsedStartTag): ParsedEndTag | void
}
