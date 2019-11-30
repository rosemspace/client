//todo
// - remove warning about optional element closing
// - switch parser functionality
// - add instruction list functionality
// - add middleware functionality
// - migrate extension from mime types to namespaces

import { NodeName, NodeType } from '@rosemlabs/dom-api'
import {
  APPLICATION_XML_MIME_TYPE,
  // XLINK_NAMESPACE,
  XML_NAMESPACE,
  // XMLNS_NAMESPACE,
  XML_DEFAULT_NAMESPACE_MAP
} from '@rosemlabs/w3-util'
import {
  attributeRegExp,
  cDataSectionRegExp,
  cDataSectionStartRegExp,
  commentRegExp,
  commentStartRegExp,
  declarationRegExp,
  declarationStartRegExp,
  endTagRegExp,
  processingInstructionRegExp,
  processingInstructionStartRegExp,
  startTagCloseRegExp,
  startTagOpenRegExp,
} from '@rosemlabs/xml-util'
import { decodeBaseEntities } from './baseEntities'
import { NamespaceMap, TypeMap } from './index'
import { Attr, Content, Element, LocationMeta } from './node/index'
import XMLHookList from './HookList'
import XMLProcessor, { XMLProcessorMap } from './XMLProcessor'

type ParsingInstruction<T extends LocationMeta> = () => T | void
type ParsingHook<T extends LocationMeta> = <U extends T>(node: U) => void

export type XMLParserOptions = Partial<{
  decodeNewlines: boolean
  decodeNewlinesForHref: boolean
  suppressDeclarations: boolean
  suppressComments: boolean
  suppressProcessingInstructions: boolean
  suppressWarnings: boolean
  nameUppercase: boolean
}>

const defaultOptions: Required<XMLParserOptions> = {
  decodeNewlines: false,
  decodeNewlinesForHref: false,
  suppressDeclarations: false,
  suppressComments: false,
  suppressProcessingInstructions: false,
  suppressWarnings: false,
  nameUppercase: false,
}

export default class XMLParser<T extends XMLParserOptions = XMLParserOptions>
  implements XMLProcessor, XMLHookList {
  private readonly nameTransformer: (name: string) => string

  protected readonly defaultNamespaceURI: string = XML_NAMESPACE
  protected readonly defaultNamespaceMap: NamespaceMap = XML_DEFAULT_NAMESPACE_MAP
  protected namespaceURI: string = XML_NAMESPACE
  protected options: Required<T>
  protected readonly processorMap: XMLProcessorMap
  protected activeProcessor: XMLProcessor = this
  protected readonly plugins: XMLHookList[] = []
  protected readonly instructionList: [
    ParsingInstruction<Element | Content>,
    ParsingHook<Element | Content>
  ][] = [
    [
      this.parseProcessingInstruction,
      this.processingInstruction as ParsingHook<Content>,
    ],
    [this.parseCDataSection, this.cDataSection as ParsingHook<Content>],
    [this.parseComment, this.comment as ParsingHook<Content>],
    [this.parseDeclaration, this.declaration as ParsingHook<Content>],
    [this.parseEndTag, this.endTag as ParsingHook<Element>],
    [this.parseStartTag, this.startElement as ParsingHook<Element>],
    [this.parseText, this.text as ParsingHook<Content>],
  ]
  protected instructionIndex: number = 0
  protected typeMap: TypeMap = {
    [APPLICATION_XML_MIME_TYPE]: XML_NAMESPACE,
  }
  protected namespaceMap: NamespaceMap = this.defaultNamespaceMap
  protected originalSource: string = ''
  protected source: string = ''
  protected sourceCursor: number = 0
  protected readonly rootTagStack: Element[] = []
  protected readonly tagStack: Element[] = []

  constructor(options?: T, processorMap?: XMLProcessorMap) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    } as Required<T>
    this.processorMap = processorMap || {
      [XML_NAMESPACE]: XMLParser.prototype,
    }
    this.nameTransformer = this.options.nameUppercase
      ? String.prototype.toUpperCase.call
      : String.prototype.toLowerCase.call
  }

  get rootNamespaceURI(): string {
    if (this.rootTagStack.length) {
      const rootTagNamespaceURI = this.rootTagStack[
        this.rootTagStack.length - 1
      ].namespaceURI

      if (null != rootTagNamespaceURI) {
        return rootTagNamespaceURI
      }
    }

    return this.defaultNamespaceURI
  }

  parseFromString(
    source: string,
    mimeType: string = APPLICATION_XML_MIME_TYPE
  ): void {
    this.originalSource = this.source = source
    // Clear previous data
    this.namespaceURI = this.defaultNamespaceURI
    this.namespaceMap = { ...this.defaultNamespaceMap }
    this.sourceCursor = this.rootTagStack.length = this.tagStack.length = 0
    this.useProcessor(this.typeMap[mimeType])
    this.start(mimeType)

    let node: Content | Element | void

    while (this.source) {
      for (
        this.instructionIndex = 0;
        this.instructionIndex < this.instructionList.length;
        ++this.instructionIndex
      ) {
        const [parsingInstruction, hook] = this.instructionList[
          this.instructionIndex
        ]

        if ((node = parsingInstruction.call(this))) {
          hook.call(this, node)

          // break
        }
      }
    }

    // Clean up any remaining tags
    // const endTag = this.parseEndTag() //todo
    //
    // if (endTag) {
    //   this.endTag(endTag);
    // }

    this.end()
  }

  addPlugin(plugin: XMLHookList): void {
    this.plugins.push(plugin)
  }

  addNamespace(prefix: string, namespaceURI: string) {
    this.namespaceMap[prefix] = namespaceURI
  }

  addProcessor(
    associatedType: string,
    namespaceURI: string,
    processor: XMLProcessor
  ) {
    this.processorMap[(this.typeMap[associatedType] = namespaceURI)] = processor
  }

  protected addInstruction<T extends Element | Content>(
    parse: ParsingInstruction<T>,
    handle: ParsingHook<T>,
    order: number = this.instructionList.length - 1
  ) {
    this.instructionList.splice(order, 0, [parse, handle])
  }

  protected useProcessor(namespaceURI: string = XML_NAMESPACE): void {
    if (!(this.activeProcessor = this.processorMap[namespaceURI])) {
      throw new TypeError(
        `Cannot process foreign element with ${
          namespaceURI ? 'the namespace: ' + namespaceURI : 'empty namespace'
        }`
      )
    }
  }

  protected moveSourceCursor(n: number): number {
    this.source = this.source.slice(n)

    return (this.sourceCursor += n)
  }

  protected resetInstructionPointer() {
    this.instructionIndex = -1
  }

  isVoidElement(element: Element): boolean {
    return Boolean(element.unarySlash)
  }

  startsWithInstruction(source: string): boolean {
    return (
      processingInstructionStartRegExp.test(source) ||
      declarationStartRegExp.test(source) ||
      commentStartRegExp.test(source) ||
      cDataSectionStartRegExp.test(source) ||
      endTagRegExp.test(source) ||
      startTagOpenRegExp.test(source)
    )
  }

  matchingStartTagMissed(element: Element): Element | void {
    if (!this.options.suppressWarnings) {
      this.warn(`<${element.tagName}> element has no matching start tag`, {
        __starts: element.__starts,
        __ends: element.__ends,
      })
    }

    this.moveSourceCursor(element.__ends - element.__starts)
    this.resetInstructionPointer()
  }

  matchingEndTagMissed(element: Element): Element | void {
    if (!this.options.suppressWarnings) {
      this.warn(`<${element.tagName}> element has no matching end tag`, {
        __starts: element.__starts,
        __ends: element.__ends,
      })
    }

    this.endTag({
      ...element,
      start: this.sourceCursor,
      end: this.sourceCursor,
    })
  }

  protected parseSection(
    regExp: RegExp,
    nodeType: NodeType,
    nodeName: NodeName
  ): Content | void {
    const contentMatch: RegExpMatchArray | null = this.source.match(regExp)

    if (!contentMatch) {
      return
    }

    const content: Content = {
      nodeType,
      nodeName,
      textContent: contentMatch[1],
      __starts: this.sourceCursor,
      __ends: this.sourceCursor + contentMatch[0].length,
    }

    this.moveSourceCursor(contentMatch[0].length)

    return content
  }

  parseProcessingInstruction(): Content | void {
    return this.parseSection(
      processingInstructionRegExp,
      NodeType.PROCESSING_INSTRUCTION_NODE,
      NodeName.TEXT_NODE
    )
  }

  parseDeclaration(): Content | void {
    return this.parseSection(
      declarationRegExp,
      NodeType.XML_DECLARATION_NODE,
      //todo declaration name
      NodeName.COMMENT_NODE
    )
  }

  parseComment(): Content | void {
    return this.parseSection(
      commentRegExp,
      NodeType.COMMENT_NODE,
      NodeName.COMMENT_NODE
    )
  }

  parseCDataSection(): Content | void {
    return this.parseSection(
      cDataSectionRegExp,
      NodeType.CDATA_SECTION_NODE,
      NodeName.CDATA_SECTION_NODE
    )
  }

  parseStartTag(): Element | void {
    const startTagOpenMatch: RegExpMatchArray | null = this.source.match(
      startTagOpenRegExp
    )

    if (!startTagOpenMatch) {
      return
    }

    const nodeName: string = startTagOpenMatch[1]

    if (!nodeName) {
      return
    }

    const tagName: string = this.nameTransformer(nodeName)
    const prefix: string = startTagOpenMatch[2] && this.nameTransformer(startTagOpenMatch[2])
    const localName: string = this.nameTransformer(startTagOpenMatch[3])
    const attributes: Attr[] = []
    const element: Element = {
      nodeType: NodeType.ELEMENT_NODE,
      tagName,
      nodeName,
      namespaceURI: this.namespaceURI,
      prefix,
      localName,
      attributes,
      unarySlash: '',
      void: false,
      __starts: this.sourceCursor,
      __ends: this.sourceCursor,
    }

    this.moveSourceCursor(startTagOpenMatch[0].length)

    let startTagCloseTagMatch: RegExpMatchArray | null
    let attrMatch: RegExpMatchArray | null

    // Parse attributes while tag is open
    while (
      !(startTagCloseTagMatch = this.source.match(startTagCloseRegExp)) &&
      (attrMatch = this.source.match(attributeRegExp))
    ) {
      // Qualified name of an attribute, i. e. "xlink:href"
      const name = this.nameTransformer(attrMatch[1])
      // Local name of an attribute, i. e. "xlink" (before ":")
      const [prefix, localName] = name.split(':', 2)
      const attr: Attr = {
        nodeType: NodeType.ATTRIBUTE_NODE,
        nodeName: attrMatch[1],
        name,
        prefix,
        localName,
        namespaceURI: undefined,
        ownerElement: element,
        value: decodeBaseEntities(
          attrMatch[3] || attrMatch[4] || attrMatch[5] || '',
          'a' === tagName && 'href' === name
            ? this.options.decodeNewlinesForHref
            : this.options.decodeNewlines
        ),
        __starts:
          this.sourceCursor +
          (attrMatch[0].match(/^\s*/) as RegExpMatchArray).length,
        __ends: this.moveSourceCursor(attrMatch[0].length),
      }

      // Add namespace
      if ('xmlns' === prefix) {
        // if (attr.value) {
        if (localName) {
          this.addNamespace(localName, attr.value)
          // this.namespaceURI = element.namespaceURI = this.rootNamespaceURI
        } else {
          this.addNamespace(
            tagName,
            (this.namespaceURI = element.namespaceURI = attr.value)
          )
        } // else {
        //   this.namespaceURI = element.namespaceURI = this.rootNamespaceURI
        // }
        // }
      } else if (localName) {
        // Add namespace of attribute
        if (
          null == (attr.namespaceURI = this.namespaceMap[prefix]) &&
          !this.options.suppressWarnings
        ) {
          this.warn(`Namespace not found for attribute prefix: ${prefix}`, {
            __starts: attr.__starts,
            __ends: attr.__starts + prefix.length,
          })
        }
      }

      if (!localName) {
        attr.localName = prefix
        attr.prefix = undefined
      }

      attributes.push(attr)
    }

    // If tag is closed
    if (startTagCloseTagMatch) {
      element.unarySlash = startTagCloseTagMatch[1]
      element.void = this.activeProcessor.isVoidElement.call(this, element)
      element.__ends = this.moveSourceCursor(startTagCloseTagMatch[0].length)

      if (prefix) {
        const namespaceURI: string = this.namespaceMap[prefix]

        if (null != namespaceURI) {
          this.namespaceURI = element.namespaceURI = namespaceURI
        } else if (!this.options.suppressWarnings) {
          this.warn(`Namespace not found for tag prefix: ${prefix}`, {
            __starts: this.sourceCursor,
            __ends: this.sourceCursor + prefix.length,
          })
        }
      }

      // We don't have namespace from closest foreign element
      if (
        null == this.namespaceURI &&
        this.rootTagStack.length &&
        !this.rootTagStack[this.rootTagStack.length - 1].namespaceURI
      ) {
        if (!this.options.suppressWarnings) {
          this.warn(
            `<${element.tagName}> element is not allowed in context of <${this.rootTagStack[this.rootTagStack.length - 1].tagName}> element without namespace.`,
            {
              __starts: element.__starts,
              __ends: element.__ends,
            }
          )
        }

        this.useProcessor((this.namespaceURI = this.defaultNamespaceURI))
      }

      this.activeProcessor.startTagFound.call(this, element)

      if (!element.void) {
        // Add start tag to the stack of opened tags
        this.tagStack.push(element)
      }

      return element
    } else {
      if (!this.options.suppressWarnings) {
        // When a tag starts with "<abc<" (just the example)
        this.warn(
          `Mal-formatted tag${
            this.tagStack.length ? '' : ' at end of template'
          }: <${element.tagName}`,
          {
            __starts: element.__starts,
            __ends: this.sourceCursor,
          }
        )
      }

      this.resetInstructionPointer()
    }
  }

  parseEndTag(): Element | void {
    const endTagMatch: RegExpMatchArray | null = this.source.match(endTagRegExp)

    if (!endTagMatch) {
      return
    }

    const nodeName: string = endTagMatch[1]

    if (!nodeName) {
      this.moveSourceCursor(endTagMatch[0].length)
      this.resetInstructionPointer()

      return
    }

    const tagName: string = this.nameTransformer(nodeName)
    let [prefix, localName] = tagName.split(':', 2)
    let lastIndex

    if (!localName) {
      localName = prefix
      prefix = undefined!
    }

    // Find the closest opened tag of the same type
    for (lastIndex = this.tagStack.length - 1; lastIndex >= 0; --lastIndex) {
      if (tagName === this.tagStack[lastIndex].tagName) {
        // Switch processor back before foreign tag
        if (
          this.rootTagStack.length &&
          this.tagStack[lastIndex].tagName ===
            this.rootTagStack[this.rootTagStack.length - 1].tagName
        ) {
          this.rootTagStack.pop()

          if (null != (this.namespaceURI = this.rootNamespaceURI)) {
            this.useProcessor(this.namespaceURI)
          }
        }

        break
      }
    }

    if (lastIndex >= 0) {
      // Close all the open elements, up the stack
      for (let index = this.tagStack.length - 1; index > lastIndex; --index) {
        this.activeProcessor.matchingEndTagMissed.call(
          this,
          this.tagStack[index]
        )
      }

      const endTag: Element = {
        ...this.tagStack[lastIndex],
        __starts: this.sourceCursor,
        __ends: this.sourceCursor + endTagMatch[0].length,
      }

      // Remove the open elements from the stack
      this.tagStack.length = lastIndex
      this.moveSourceCursor(endTagMatch[0].length)

      return endTag
    } else {
      return this.activeProcessor.matchingStartTagMissed.call(this, {
        nodeType: NodeType.ELEMENT_NODE,
        nodeName,
        tagName,
        prefix,
        localName,
        namespaceURI: this.namespaceURI,
        attributes: [],
        void: false,
        unarySlash: '',
        __starts: this.sourceCursor,
        __ends: this.sourceCursor + endTagMatch[0].length,
      })
    }
  }

  parseText(): Content | void {
    let textEndTokenIndex: number = this.source.indexOf('<')
    let textContent: string | undefined

    if (textEndTokenIndex >= 0) {
      let rest = this.source.slice(textEndTokenIndex)
      let ignoreCharIndex

      // Do not treat character "<" in plain text as a parser instruction
      while (
        !this.activeProcessor.startsWithInstruction.call(this, rest) &&
        (ignoreCharIndex = rest.indexOf('<', 1)) >= 0
      ) {
        textEndTokenIndex += ignoreCharIndex
        rest = this.source.slice(textEndTokenIndex)
      }

      textContent = this.source.slice(0, textEndTokenIndex)
    } else {
      textContent = this.source
    }

    // todo: do we need this?
    if (!textContent && !textEndTokenIndex) {
      textContent = this.source
    }

    // Ensure we don't have an empty string
    if (textContent) {
      const text: Content = {
        nodeType: NodeType.TEXT_NODE,
        nodeName: NodeName.TEXT_NODE,
        textContent,
        __starts: this.sourceCursor,
        __ends: this.sourceCursor + textContent.length,
      }

      this.moveSourceCursor(textContent.length)

      return text
    }
  }

  startTagFound(): void {}

  start(type: string): void {
    for (const plugin of this.plugins) {
      plugin.start && plugin.start(type)
    }
  }

  processingInstruction<T extends Content>(processingInstruction: T): void {
    for (const module of this.plugins) {
      module.processingInstruction &&
        module.processingInstruction(processingInstruction)
    }
  }

  declaration<T extends Content>(declaration: T): void {
    for (const plugin of this.plugins) {
      plugin.declaration && plugin.declaration(declaration)
    }
  }

  startElement<T extends Element>(element: T): void {
    for (const plugin of this.plugins) {
      plugin.openElement && plugin.openElement(element)
    }

    element.attributes.forEach((attr: Attr): void => {
      this.attribute(attr)
    })

    if (element.void) {
      this.endTag(element)
    }

    // todo: check why it's important
    this.resetInstructionPointer()
  }

  attribute<T extends Attr>(attr: T): void {
    for (const plugin of this.plugins) {
      plugin.attribute && plugin.attribute(attr)
    }
  }

  endTag<T extends Element>(endTag: T): void {
    for (const plugin of this.plugins) {
      plugin.closeElement && plugin.closeElement(endTag)
    }

    this.resetInstructionPointer()
  }

  text<T extends Content>(text: T): void {
    for (const plugin of this.plugins) {
      plugin.text && plugin.text(text)
    }
  }

  comment<T extends Content>(comment: T) {
    if (!this.options.suppressComments) {
      for (const plugin of this.plugins) {
        plugin.comment && plugin.comment(comment)
      }
    }
  }

  cDataSection<T extends Content>(cDATASection: T): void {
    for (const plugin of this.plugins) {
      plugin.cDataSection && plugin.cDataSection(cDATASection)
    }
  }

  warn(message: string, location: LocationMeta): void {
    for (const plugin of this.plugins) {
      plugin.warn && plugin.warn(message, location)
    }
  }

  end(): void {
    for (const plugin of this.plugins) {
      plugin.end && plugin.end()
    }
  }
}
