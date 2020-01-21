import { NodeType } from '@rosemlabs/dom-api'
import { VElement } from '../ast'
import Tokenizer, { CommonEventMap, Module } from '../Tokenizer'
import { endTagRegExp } from '../utils/xml'
import TokenParser from './TokenParser'

export type EndTagParserEventMap = {
  endTag: VElement
} & CommonEventMap

export default class EndTagParser extends TokenParser<EndTagParserEventMap> {
  protected readonly startDelimiter: string = '</'

  test(source: string): boolean {
    return endTagRegExp.test(source)
  }

  parse(
    source: string,
    hooks?: Module<EndTagParserEventMap>,
    tokenizer: Tokenizer<EndTagParserEventMap> = new Tokenizer(
      [],
      hooks,
      source
    )
  ): VElement | void {
    const match: string[] | null = source.match(endTagRegExp)

    if (!match) {
      return
    }

    tokenizer.consume(match[0].length)

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

    const element: VElement = {
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

    tokenizer.emit('endTag', element)

    return element
  }
}
