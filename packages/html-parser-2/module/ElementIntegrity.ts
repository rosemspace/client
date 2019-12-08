import { Element, HTMLParserHooks, Module, Tokenizer } from '../index'

const assign = Object.assign

export default class ElementIntegrity implements Module<HTMLParserHooks> {
  private readonly tokenizer: Tokenizer<HTMLParserHooks>
  private readonly elementStack: Element[] = []

  constructor(tokenizer: Tokenizer<HTMLParserHooks>) {
    this.tokenizer = tokenizer
  }

  onStartTagOpen(element: Element): void {
    if (!element.void) {
      // Add start tag to the stack of opened tags
      this.elementStack.push(element)
    }
  }

  onEndTag(element: Element): void {
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
        this.matchingEndTagMissed(this.elementStack[index])
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
      // tokenizer.advance(endTagMatch[0].length)

      // tokenizer.endTag && tokenizer.endTag(closeElement)
    } else {
      this.matchingStartTagMissed(element)
    }
  }

  protected matchingStartTagMissed(element: Element): void {
    this.tokenizer.error({
      code: 0, //todo
      message: `<${element.tagName}> element has no matching start tag`,
      __starts: element.__starts,
      __ends: element.__ends,
    })

    // No need
    // this.tokenizer.advance(element.__ends - element.__starts)
    // this.tokenizer.replaceToken(this.tokenizer.token().next().value)
    this.tokenizer.skipToken()
  }

  protected matchingEndTagMissed(element: Element): void {
    this.tokenizer.error({
      code: 0, //todo
      message: `<${element.tagName}> element has no matching end tag`,
      __starts: element.__starts,
      __ends: element.__ends,
    })

    this.tokenizer.emit('onEndTag', {
      ...element,
      __starts: this.tokenizer.cursorPosition,
      __ends: this.tokenizer.cursorPosition,
    })
  }
}
