import { Element } from './nodes'

export interface SuccessProcessor {
  startTagFound<T extends Element>(element: T): void
}

export interface ErrorProcessor {
  matchingStartTagMissed<T extends Element>(element: T): void

  matchingEndTagMissed<T extends Element>(element: T): void
}

export default interface Reader extends SuccessProcessor, ErrorProcessor {
  // startsWithNonTextNode(source: string): boolean
  //
  // isVoidElement(startTag: Element): boolean
  //
  // startTagFound(startTag: StartTag): void
}
