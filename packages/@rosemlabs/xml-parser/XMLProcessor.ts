import { EndTag, StartTag } from './nodes'

export type XMLProcessorMap = { [mimeType: string]: XMLProcessor }

export default interface XMLProcessor {
  // parseProcessingInstruction(): Content | void
  //
  // parseDeclaration(): Content | void
  //
  // parseStartTag(): StartTag | void
  //
  // parseEndTag(): EndTag | void
  //
  // parseComment(): Content | void
  //
  // parseCDataSection(): Content | void
  //
  // parseText(): Content | void

  startsWithInstruction(source: string): boolean

  isVoidElement(startTag: StartTag): boolean

  startTagFound(startTag: StartTag): void

  matchingStartTagMissed(endTag: EndTag): EndTag | void

  matchingEndTagMissed(startTag: StartTag): EndTag | void
}
