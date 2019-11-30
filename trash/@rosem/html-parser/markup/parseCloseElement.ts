import { endTagRegExp } from '@rosemlabs/xml-util'
import { NodeType } from '@rosemlabs/dom-api'
import Tokenizer from '@rosemlabs/html-parser/Tokenizer'
import { ElementHook, WarningHook } from '../HookList'
import { Element } from '../node'
import { createFractionParser, FractionParser, TokenParser } from './index'

export const parseCloseElementToken: TokenParser<Element> = (
  tokenMatch: RegExpMatchArray,
  hooks: {
    closeElement?: ElementHook
    warn?: WarningHook
  } = {
    //todo: remove
    closeElement: console.dir,
    warn: console.warn,
  },
  state: Tokenizer
): Element | void => {
  state.advance(tokenMatch[0].length)

  const tagName: string = tokenMatch[1]

  if (!tagName) {
    state.resetTokenParserPointer()

    return
  }

  let [prefix, localName] = tagName.split(':', 2)
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
    nodeName: tagName,
    tagName,
    prefix,
    localName,
    // NAMESPACE PLUGIN
    // namespaceURI: this.namespaceURI,
    attributes: [],
    void: false,
    unarySlash: '',
    __starts: state.cursorPosition - tokenMatch[0].length,
    __ends: state.cursorPosition,
  }

  hooks.closeElement && hooks.closeElement(element, state)

  return element
}

const parseCloseElement: FractionParser<Element> = createFractionParser<Element>(
  endTagRegExp,
  parseCloseElementToken
)

export default parseCloseElement
