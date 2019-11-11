import { NodeType } from '@rosemlabs/dom-api'
import { endTagRegExp } from '@rosemlabs/xml-util'
import {
  Element,
  TokenHook,
  Tokenizer,
  TokenParser,
  WithWarningHook,
} from '../index'

export type EndTagParserHooks = Partial<{
  onEndTag: TokenHook<Element>
}>

export default class EndTagParser extends RegExp
  implements TokenParser<Element, EndTagParserHooks> {
  private hooks?: WithWarningHook<EndTagParserHooks> = {
    //todo: remove
    onEndTag: console.dir,
    warn: console.warn,
  }

  constructor(hooks?: WithWarningHook<EndTagParserHooks>) {
    super(endTagRegExp)

    this.hooks = hooks
  }

  parse(
    source: string,
    tokenizer: Tokenizer<EndTagParserHooks> = new Tokenizer(
      [],
      this.hooks ? [this.hooks] : [],
      source
    )
  ): Element | void {
    const match: string[] | null = this.exec(source)

    if (!match) {
      return
    }

    tokenizer.advance(match[0].length)

    const nodeName: string = match[1]

    if (!nodeName) {
      tokenizer.skipToken()

      return
    }

    let [prefix, localName] = nodeName.split(':', 2)
    // let lastIndex

    if (!localName) {
      localName = prefix
      prefix = undefined!
    }

    // INTEGRITY PLUGIN
    // Find the closest opened tag of the same type
    // for (lastIndex = this.tagStack.length - 1; lastIndex >= 0; --lastIndex) {
    //   if (tagName === this.tagStack[lastIndex].tagName) {
    //  // EMBEDDED DOCUMENT PLUGIN
    //   // Switch processor back before foreign tag
    //   if (
    //     this.rootTagStack.length &&
    //     this.tagStack[lastIndex].tagName ===
    //       this.rootTagStack[this.rootTagStack.length - 1].tagName
    //   ) {
    //     this.rootTagStack.pop()
    //
    //     if (null != (this.namespaceURI = this.rootNamespaceURI)) {
    //       this.useProcessor(this.namespaceURI)
    //     }
    //   }
    //
    //   break
    // }
    // }

    // INTEGRITY PLUGIN
    // if (lastIndex >= 0) {
    //   // Close all the open elements, up the stack
    //   for (let index = this.tagStack.length - 1; index > lastIndex; --index) {
    //     this.activeProcessor.matchingEndTagMissed.call(this, this.tagStack[index])
    //   }
    //
    //   const endTag: Element = {
    //     ...this.tagStack[lastIndex],
    //     // LOCATION PLUGIN
    //     // __starts: this.sourceCursor,
    //     // __ends: this.sourceCursor + endTagMatch[0].length,
    //   }
    //
    //   // Remove the open elements from the stack
    //   this.tagStack.length = lastIndex
    //   this.moveSourceCursor(endTagMatch[0].length)
    //
    //   return endTag
    // } else {
    //   return this.activeProcessor.matchingStartTagMissed.call(this, {/*...*/})
    // }

    const element: Element = {
      nodeType: NodeType.ELEMENT_NODE,
      nodeName,
      tagName: nodeName.toLowerCase(),
      prefix,
      localName,
      // NAMESPACE PLUGIN
      // namespaceURI: this.namespaceURI,
      attributes: [],
      void: false,
      unarySlash: '',
      __starts: tokenizer.cursorPosition - match[0].length,
      __ends: tokenizer.cursorPosition,
    }

    tokenizer.emit('onEndTag', element)

    return element
  }
}
