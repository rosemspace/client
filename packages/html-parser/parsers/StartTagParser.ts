import { NodeType } from '@rosemlabs/dom-api'
import { VAttr, VElement } from '../ast'
import { ErrorCode } from '../errors'
import Tokenizer, { CommonEventMap, Module } from '../Tokenizer'
import {
  attributeRegExp,
  startTagCloseRegExp,
  startTagOpenRegExp,
} from '../utils/xml'
import TokenParser from './TokenParser'

export type StartTagParserEventMap = {
  startTagOpen: VElement
  attribute: VAttr
  startTag: VElement
} & CommonEventMap

export default class StartTagParser extends TokenParser<
  StartTagParserEventMap
> {
  protected readonly startDelimiter: string = '<'

  test(source: string): boolean {
    return startTagOpenRegExp.test(source)
  }

  parse(
    source: string,
    hooks?: Module<StartTagParserEventMap>,
    tokenizer: Tokenizer<StartTagParserEventMap> = new Tokenizer(
      [],
      hooks,
      source
    )
  ): VElement | void {
    const match: string[] | null = source.match(startTagOpenRegExp)

    if (!match) {
      return
    }

    const nodeName: string = match[1]

    if (!nodeName) {
      return
    }

    const prefix: string | undefined = match[2]
    const localName: string = match[3]
    const attributes: VAttr[] = []
    const element: VElement = {
      nodeType: NodeType.ELEMENT_NODE,
      nodeName,
      tagName: nodeName.toLowerCase(),
      // NAMESPACE PLUGIN
      // namespaceURI: this.namespaceURI,
      prefix,
      localName,
      attributes,
      unarySlash: '',
      void: false,
      __starts: tokenizer.cursorPosition,
      __ends: tokenizer.cursorPosition,
    }

    tokenizer.consume(match[0].length)
    tokenizer.emit('startTagOpen', element)
    source = tokenizer.remainingSource

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
      const attr: VAttr = {
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
          tokenizer.cursorPosition +
          (attrMatch[0].match(/^\s*/) as RegExpMatchArray).length,
        __ends: tokenizer.consume(attrMatch[0].length),
      }

      source = tokenizer.remainingSource

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
      //     !this.options.suppressErrors
      //   ) {
      //     this.error(`Namespace not found for attribute prefix: ${prefix}`, {
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
      tokenizer.emit('attribute', attr)
    }

    // If tag is closed
    if (startTagCloseTagMatch) {
      element.unarySlash = startTagCloseTagMatch[1]
      element.void = Boolean(element.unarySlash)
      element.__ends = tokenizer.consume(startTagCloseTagMatch[0].length)

      // NAMESPACE PLUGIN
      // if (prefix) {
      //   const namespaceURI: string = this.namespaceMap[prefix]
      //
      //   if (null != namespaceURI) {
      //     this.namespaceURI = element.namespaceURI = namespaceURI
      //   } else if (!this.options.suppressErrors) {
      //     this.error(`Namespace not found for tag prefix: ${prefix}`, {
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
      //   if (!this.options.suppressErrors) {
      //     this.error(
      //       `<${element.tagName}> element is not allowed in context of
      // <${this.rootTagStack[this.rootTagStack.length - 1].tagName}> element
      // without namespace.`, { __starts: element.__starts, __ends:
      // element.__ends, } ) }  this.useProcessor((this.namespaceURI =
      // this.defaultNamespaceURI)) }

      // this.activeProcessor.startTagFound.call(this, element)

      // INTEGRITY PLUGIN
      // if (!element.void) {
      //   // Add start tag to the stack of opened tags
      //   this.tagStack.push(element)
      // }
    } else {
      // When a tag starts with "<abc<" (just the example)
      tokenizer.emit(
        'error',
        tokenizer.error(ErrorCode.EOF_IN_TAG, {
          __starts: element.__starts,
          __ends: tokenizer.cursorPosition,
        })
      )
      //todo: add correct __ends
      // tokenizer.skipToken()
    }

    tokenizer.emit('startTag', element)

    return element
  }
}
