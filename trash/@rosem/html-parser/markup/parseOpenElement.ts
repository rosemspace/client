import {
  attributeRegExp,
  startTagCloseRegExp,
  startTagOpenRegExp,
} from '@rosemlabs/xml-util'
import { NodeType } from '@rosemlabs/dom-api'
import { Attr, Element } from '../node'
import { AttrHook, ElementHook, WarningHook } from '../HookList'
import Tokenizer from '@rosemlabs/html-parser/Tokenizer'
import { TokenParser, createFractionParser, FractionParser } from './index'

export const parseOpenElementToken: TokenParser<Element> = (
  tokenMatch: RegExpMatchArray,
  hooks: {
    openElement?: ElementHook
    attribute?: AttrHook
    warn?: WarningHook
  } = {
    //todo: remove
    openElement: console.dir,
    warn: console.warn,
  },
  state: Tokenizer
): Element | void => {
  const tagName: string = tokenMatch[1]

  if (!tagName) {
    return
  }

  const prefix: string | undefined = tokenMatch[2]
  const localName: string = tokenMatch[3]
  const attributes: Attr[] = []
  const element: Element = {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: tagName,
    tagName,
    // NAMESPACE PLUGIN
    // namespaceURI: this.namespaceURI,
    prefix,
    localName,
    attributes,
    unarySlash: '',
    void: false,
    __starts: state.cursorPosition,
    __ends: state.cursorPosition,
  }

  state.advance(tokenMatch[0].length)

  let source = state.remainingSource
  let startTagCloseTagMatch: RegExpMatchArray | null
  let attrMatch: RegExpMatchArray | null

  // Parse attributes while tag is open
  while (
    !(startTagCloseTagMatch = source.match(startTagCloseRegExp)) &&
    //todo: attributeRegExp is wrong
    (attrMatch = source.match(attributeRegExp))
  ) {
    // Qualified name of an attribute, i. e. "xlink:href"
    const name = attrMatch[1]
    // Local name of an attribute, i. e. "xlink" (before ":")
    const [prefix, localName] = name.split(':', 2)
    const attr: Attr = {
      nodeType: NodeType.ATTRIBUTE_NODE,
      nodeName: attrMatch[1],
      name,
      prefix,
      localName,
      // NAMESPACE PLUGIN
      // namespaceURI: undefined,
      ownerElement: element,
      // ENTITIES ENCODING PLUGIN
      value: attrMatch[3] || attrMatch[4] || attrMatch[5] || '',
      __starts:
        state.cursorPosition +
        (attrMatch[0].match(/^\s*/) as RegExpMatchArray).length,
      __ends: state.advance(attrMatch[0].length),
    }

    source = state.remainingSource

    // NAMESPACE PLUGIN
    // // Add namespace
    // if ('xmlns' === prefix) {
    //   // if (attr.value) {
    //   if (localName) {
    //     this.addNamespace(localName, attr.value)
    //     // this.namespaceURI = element.namespaceURI = this.rootNamespaceURI
    //   } else {
    //     this.addNamespace(
    //       tagName,
    //       (this.namespaceURI = element.namespaceURI = attr.value)
    //     )
    //   } // else {
    //   //   this.namespaceURI = element.namespaceURI = this.rootNamespaceURI
    //   // }
    //   // }
    // } else if (localName) {
    //   // Add namespace of attribute
    //   if (
    //     null == (attr.namespaceURI = this.namespaceMap[prefix]) &&
    //     !this.options.suppressWarnings
    //   ) {
    //     this.warn(`Namespace not found for attribute prefix: ${prefix}`, {
    //       __starts: attr.__starts,
    //       __ends: attr.__starts + prefix.length,
    //     })
    //   }
    // }

    if (!localName) {
      attr.localName = prefix
      attr.prefix = undefined
    }

    attributes.push(attr)
    hooks.attribute && hooks.attribute(attr, state)
  }

  // If tag is closed
  if (startTagCloseTagMatch) {
    element.unarySlash = startTagCloseTagMatch[1]
    element.void = Boolean(element.unarySlash)
    element.__ends = state.advance(startTagCloseTagMatch[0].length)

    // NAMESPACE PLUGIN
    // if (prefix) {
    //   const namespaceURI: string = this.namespaceMap[prefix]
    //
    //   if (null != namespaceURI) {
    //     this.namespaceURI = element.namespaceURI = namespaceURI
    //   } else if (!this.options.suppressWarnings) {
    //     this.warn(`Namespace not found for tag prefix: ${prefix}`, {
    //       __starts: this.sourceCursor,
    //       __ends: this.sourceCursor + prefix.length,
    //     })
    //   }
    // }

    // EMBEDDED DOCUMENT PLUGIN
    // // We don't have namespace from closest foreign element
    // if (
    //   null == this.namespaceURI &&
    //   this.rootTagStack.length &&
    //   !this.rootTagStack[this.rootTagStack.length - 1].namespaceURI
    // ) {
    //   if (!this.options.suppressWarnings) {
    //     this.warn(
    //       `<${element.tagName}> element is not allowed in context of <${this.rootTagStack[this.rootTagStack.length - 1].tagName}> element without namespace.`,
    //       {
    //         __starts: element.__starts,
    //         __ends: element.__ends,
    //       }
    //     )
    //   }
    //
    //   this.useProcessor((this.namespaceURI = this.defaultNamespaceURI))
    // }

    // this.activeProcessor.startTagFound.call(this, element)

    // INTEGRITY PLUGIN
    // if (!element.void) {
    //   // Add start tag to the stack of opened tags
    //   this.tagStack.push(element)
    // }
  } else {
    // When a tag starts with "<abc<" (just the example)
    hooks.warn &&
      hooks.warn(`Mal-formatted tag <${element.tagName}`, {
        __starts: element.__starts,
        __ends: state.cursorPosition,
      })
    //todo: add correct __ends
    state.resetTokenParserPointer()
  }

  hooks.openElement && hooks.openElement(element, state)

  return element
}

const parseOpenElement: FractionParser<Element> = createFractionParser<Element>(
  startTagOpenRegExp,
  parseOpenElementToken
)

export default parseOpenElement
