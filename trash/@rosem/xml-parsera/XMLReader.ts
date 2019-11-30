import {
  cDataSectionStartRegExp,
  commentStartRegExp,
  declarationStartRegExp,
  endTagRegExp,
  processingInstructionStartRegExp,
  startTagOpenRegExp,
} from '@rosemlabs/xml-syntax'
import TokenStream from '@rosemlabs/xml-parsera/TokenStream'
import Reader from './Reader'
import XMLHookList, {
  AttrHook,
  ContentHook,
  ElementHook,
  EndHook,
  StartHook,
} from './XMLHookList'
import { Element } from './nodes'

export default class XMLReader implements Reader, XMLHookList {
  private stream: TokenStream
  start?: StartHook
  // xmlDeclaration?<T extends Content>(declaration: T): void
  declaration?: ContentHook
  processingInstruction?: ContentHook
  startTag?: ElementHook
  attribute?: AttrHook
  endTag?: ElementHook
  text?: ContentHook
  comment?: ContentHook
  cDataSection?: ContentHook
  warn?: ContentHook
  end?: EndHook

  constructor(stream: TokenStream) {
    this.stream = stream
  }

  static startsWithNonTextNode(source: string): boolean {
    return (
      processingInstructionStartRegExp.test(source) ||
      declarationStartRegExp.test(source) ||
      commentStartRegExp.test(source) ||
      cDataSectionStartRegExp.test(source) ||
      endTagRegExp.test(source) ||
      startTagOpenRegExp.test(source)
    )
  }

  startTagFound<T extends Element>(element: T): void {
    //todo: run hook "startTag"
  }

  matchingStartTagMissed<T extends Element>(element: T): void {
    this.stream.warn(`<${element.name}> element has no matching start tag`, {
      start: element.start,
      end: element.end,
    })

    this.stream.moveCursorPosition(element.end - element.start)
    this.stream.resetNodeParserPointer()
  }

  matchingEndTagMissed<T extends Element>(element: T): void {
    this.stream.warn(`<${element.name}> element has no matching end tag`, {
      start: element.start,
      end: element.end,
    })

    this.endTag &&
      this.endTag({
        ...element,
        start: this.stream.cursorPosition,
        end: this.stream.cursorPosition,
      })
  }
}
