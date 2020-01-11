import { VElement } from '../ast'
import { ErrorCode } from '../errors'
import { HTMLParserEventMap } from '../HTMLParser'
import Tokenizer, { Module } from '../Tokenizer'

const assign = Object.assign

export function matchingStartTagMissed(
  tokenizer: Tokenizer<HTMLParserEventMap>,
  element: VElement
): void {
  // todo correct error code
  tokenizer.emit(
    'error',
    tokenizer.error(ErrorCode.MISSING_END_TAG_NAME, {
      __starts: element.__starts,
      __ends: element.__ends,
    })
  )

  // No need
  // this.tokenizer.consume(element.__ends - element.__starts)
  // this.tokenizer.replaceToken(this.tokenizer.token().next().value)
  tokenizer.skipToken()
}

export function matchingEndTagMissed(
  tokenizer: Tokenizer<HTMLParserEventMap>,
  element: VElement
): void {
  tokenizer.emit(
    'error',
    tokenizer.error(ErrorCode.MISSING_END_TAG_NAME, {
      __starts: element.__starts,
      __ends: element.__ends,
    })
  )
  tokenizer.emit('endTag', {
    ...element,
    __starts: tokenizer.cursorPosition,
    __ends: tokenizer.cursorPosition,
  })
}

export default class ElementIntegrity implements Module<HTMLParserEventMap> {
  private readonly elementStack: VElement[] = []

  register(tokenizer: Tokenizer<HTMLParserEventMap>): void {
    tokenizer.on('startTagOpen', this.onStartTagOpen.bind(this))
    tokenizer.on('endTag', this.onEndTag.bind(this, tokenizer))
  }

  onStartTagOpen(element: VElement): void {
    if (!element.void) {
      // Add start tag to the stack of opened tags
      this.elementStack.push(element)
    }
  }

  onEndTag(tokenizer: Tokenizer<HTMLParserEventMap>, element: VElement): void {
    let lastIndex: number

    // Find the closest opened tag of the same type
    for (
      lastIndex = this.elementStack.length - 1;
      lastIndex >= 0;
      --lastIndex
    ) {
      if (element.tagName === this.elementStack[lastIndex].tagName) {
        // EMBEDDED DOCUMENT PLUGIN
        //  // Switch processor back before foreign tag
        //  if (
        //    this.rootTagStack.length &&
        //    this.tagStack[lastIndex].tagName ===
        //      this.rootTagStack[this.rootTagStack.length - 1].tagName
        //  ) {
        //    this.rootTagStack.pop()
        //
        //    if (null != (this.namespaceURI = this.rootNamespaceURI)) {
        //      this.useProcessor(this.namespaceURI)
        //    }
        //  }

        break
      }
    }

    if (lastIndex >= 0) {
      // Close all the open elements, up the stack
      for (
        let index = this.elementStack.length - 1;
        index > lastIndex;
        --index
      ) {
        matchingEndTagMissed(tokenizer, this.elementStack[index])
      }

      // const closeElement: Element = {
      //   ...this.elementStack[lastIndex],
      //   // LOCATION PLUGIN
      //   // __starts: this.sourceCursor,
      //   // __ends: this.sourceCursor + endTagMatch[0].length,
      // }

      // tokenizer.currentNode = this.elementStack[lastIndex]
      assign(element, this.elementStack[lastIndex], {
        __starts: element.__starts,
        __ends: element.__ends,
      })

      // Remove the open elements from the stack
      this.elementStack.length = lastIndex
      // tokenizer.consume(endTagMatch[0].length)

      // tokenizer.endTag && tokenizer.endTag(closeElement)
    } else {
      matchingStartTagMissed(tokenizer, element)
    }
  }
}
