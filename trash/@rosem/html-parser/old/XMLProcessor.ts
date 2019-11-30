import { Content, Element } from './node'

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

  isVoidElement(element: Element): boolean

  // Start tag pass
  startTagFound(element: Element): void

  // End tag pass[, start tag release]
  matchingStartTagMissed(element: Element): Element | void

  // Start tag pass[, end tag release]
  matchingEndTagMissed(element: Element): Element | void
}
