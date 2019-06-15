//todo
// - change match interface to `matchStart` and `matchLength`
// - remove warning about optional element closing
// - switch parser functionality
// - add instruction list functionality
// - add middleware functionality
// - migrate extension from mime types to namespaces

import {
  commentStartRegExp,
  cDataSectionStartRegExp,
  endTagRegExp,
  startTagOpenRegExp,
  startTagCloseRegExp,
  attributeRegExp,
  processingInstructionRegExp,
  processingInstructionStartRegExp,
  commentRegExp,
  cDataSectionRegExp,
  declarationStartRegExp,
  declarationRegExp,
} from '@rosem/xml-syntax'
import {
  APPLICATION_XML_MIME_TYPE,
  XML_NAMESPACE,
  XMLNS_NAMESPACE,
} from '@rosem/w3-util'
import HookList from './HookList'
import XMLProcessor, { XMLProcessorMap } from './XMLProcessor'
import { MatchRange, Attr, Content, EndTag, StartTag } from './nodes'
import decodeAttrEntities from './decodeAttrEntities'
import { Mutable, NamespaceMap, TypeMap } from '.'

export const defaultNamespaceMap: NamespaceMap = {
  xml: XML_NAMESPACE,
  xmlns: XMLNS_NAMESPACE,
}

export type XMLParserOptions = {
  decodeNewlines: boolean
  decodeNewlinesForHref: boolean
  suppressComments: boolean
  suppressWarnings: boolean
}

type ParsingInstruction<T extends MatchRange> = () => T | void
type ParsingHook<T extends MatchRange> = <U extends T>(node: U) => void

const defaultOptions: XMLParserOptions = {
  decodeNewlines: false,
  decodeNewlinesForHref: false,
  suppressComments: false,
  suppressWarnings: false,
}

export default class XMLParser<T extends XMLParserOptions = XMLParserOptions>
  implements XMLProcessor, HookList {
  protected readonly defaultNamespaceURI: string = XML_NAMESPACE
  protected readonly defaultNamespaceMap: NamespaceMap = defaultNamespaceMap
  protected namespaceURI: string = XML_NAMESPACE
  protected options: T
  protected readonly processorMap: XMLProcessorMap
  protected activeProcessor: XMLProcessor = this
  protected readonly moduleList: HookList[] = []
  protected readonly instructionList: [
    ParsingInstruction<StartTag | EndTag | Content>,
    ParsingHook<StartTag | EndTag | Content>
  ][] = [
    [
      this.parseProcessingInstruction,
      this.processingInstruction as ParsingHook<Content>,
    ],
    [this.parseCDataSection, this.cDataSection as ParsingHook<Content>],
    [this.parseComment, this.comment as ParsingHook<Content>],
    [this.parseDeclaration, this.declaration as ParsingHook<Content>],
    [this.parseEndTag, this.endTag as ParsingHook<EndTag>],
    [this.parseStartTag, this.startTag as ParsingHook<StartTag>],
    [this.parseText, this.text as ParsingHook<Content>],
  ]
  protected instructionIndex: number = 0
  protected typeMap: TypeMap = {
    [APPLICATION_XML_MIME_TYPE]: XML_NAMESPACE,
  }
  protected namespaceMap: NamespaceMap = this.defaultNamespaceMap
  protected originalSource: string = ''
  protected source: string = ''
  protected cursor: number = 0
  protected readonly rootTagStack: StartTag[] = []
  protected readonly tagStack: StartTag[] = []

  constructor(options?: Partial<T>, processorMap?: XMLProcessorMap) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    } as T
    this.processorMap = processorMap || {
      [XML_NAMESPACE]: XMLParser.prototype,
    }
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
    type: string = APPLICATION_XML_MIME_TYPE
  ): void {
    this.originalSource = this.source = source
    // Clear previous data
    this.namespaceURI = this.defaultNamespaceURI
    this.namespaceMap = { ...this.defaultNamespaceMap }
    this.cursor = this.rootTagStack.length = this.tagStack.length = 0
    this.useProcessor(this.typeMap[type])
    this.start(type)

    let node: Content | StartTag | EndTag | void

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

  addModule(module: HookList): void {
    this.moduleList.push(module)
  }

  protected addInstruction<T extends StartTag | EndTag | Content>(
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

  protected moveCursor(n: number): number {
    this.source = this.source.slice(n)

    return (this.cursor += n)
  }

  protected nextToken() {
    this.instructionIndex = -1
  }

  isVoidElement(startTag: StartTag): boolean {
    return Boolean(startTag.unarySlash)
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

  matchingStartTagMissed(endTag: EndTag): EndTag | void {
    if (!this.options.suppressWarnings) {
      this.warn(`<${endTag.name}> element has no matching start tag`, {
        matchStart: endTag.matchStart,
        matchEnd: endTag.matchEnd,
      })
    }

    this.moveCursor(endTag.matchEnd - endTag.matchStart)
    this.nextToken()
  }

  matchingEndTagMissed(stackTag: StartTag): EndTag | void {
    if (!this.options.suppressWarnings) {
      this.warn(`<${stackTag.name}> element has no matching end tag`, {
        matchStart: stackTag.matchStart,
        matchEnd: stackTag.matchEnd,
      })
    }

    this.endTag({
      ...stackTag,
      matchStart: this.cursor,
      matchEnd: this.cursor,
    })
  }

  protected parseSection(regExp: RegExp): Content | void {
    const contentMatch: RegExpMatchArray | null = this.source.match(regExp)

    if (contentMatch) {
      const content: Content = {
        content: contentMatch[1],
        matchStart: this.cursor,
        matchEnd: this.cursor + contentMatch[0].length,
      }

      this.moveCursor(contentMatch[0].length)

      return content
    }
  }

  parseProcessingInstruction(): Content | void {
    return this.parseSection(processingInstructionRegExp)
  }

  parseDeclaration(): Content | void {
    return this.parseSection(declarationRegExp)
  }

  parseStartTag(): StartTag | void {
    const startTagOpenMatch: RegExpMatchArray | null = this.source.match(
      startTagOpenRegExp
    )

    if (!startTagOpenMatch) {
      return
    }

    let tagName: string = startTagOpenMatch[1]

    if (!tagName) {
      return
    }

    const tagNameLowerCased = tagName.toLowerCase()
    let [tagPrefix, tagLocalName] = tagNameLowerCased.split(':', 2)

    if (!tagLocalName) {
      tagLocalName = tagPrefix
      tagPrefix = undefined!
    }

    const attrs: Attr[] = []
    const startTag: Mutable<StartTag> = {
      name: tagName,
      prefix: tagPrefix,
      localName: tagLocalName,
      nameLowerCased: tagNameLowerCased,
      namespaceURI: this.namespaceURI,
      attrs,
      unarySlash: '',
      void: false,
      matchStart: this.cursor,
      matchEnd: this.cursor,
    }

    this.moveCursor(startTagOpenMatch[0].length)

    let startTagCloseTagMatch: RegExpMatchArray | null
    let attrMatch: RegExpMatchArray | null

    // Parse attributes while tag is open
    while (
      !(startTagCloseTagMatch = this.source.match(startTagCloseRegExp)) &&
      (attrMatch = this.source.match(attributeRegExp))
    ) {
      // Qualified name of an attribute, i. e. "xlink:href"
      const attrNameLowerCased = attrMatch[1].toLowerCase()
      // Local name of an attribute, i. e. "xlink" (before ":")
      const [attrPrefix, attrLocalName] = attrNameLowerCased.split(':', 2)
      const attr: Mutable<Attr> = {
        name: attrMatch[1],
        nameLowerCased: attrNameLowerCased,
        namespaceURI: undefined,
        prefix: attrPrefix,
        localName: attrLocalName,
        value: decodeAttrEntities(
          attrMatch[3] || attrMatch[4] || attrMatch[5] || '',
          'a' === tagNameLowerCased && 'href' === attrNameLowerCased
            ? this.options.decodeNewlinesForHref
            : this.options.decodeNewlines
        ),
        matchStart:
          this.cursor + (attrMatch[0].match(/^\s*/) as RegExpMatchArray).length,
        matchEnd: this.moveCursor(attrMatch[0].length),
      }

      // Add namespace
      if ('xmlns' === attrPrefix) {
        // if (attr.value) {
        if (attrLocalName) {
          this.addNamespace(attrLocalName, attr.value)
          // this.namespaceURI = startTag.namespaceURI = this.rootNamespaceURI
        } else {
          this.addNamespace(
            tagNameLowerCased,
            (this.namespaceURI = startTag.namespaceURI = attr.value)
          )
          attr.localName = attrPrefix
          attr.prefix = undefined
        } // else {
        //   this.namespaceURI = startTag.namespaceURI = this.rootNamespaceURI
        // }
        // }
      } else if (attrLocalName) {
        // Add namespace of attribute
        if (
          null == (attr.namespaceURI = this.namespaceMap[attrPrefix]) &&
          !this.options.suppressWarnings
        ) {
          this.warn(`Namespace not found for attribute prefix: ${attrPrefix}`, {
            matchStart: attr.matchStart,
            matchEnd: attr.matchStart + attrPrefix.length,
          })
        } else {
          // this.namespaceURI = startTag.namespaceURI = this.rootNamespaceURI
        }
      } else {
        attr.localName = attrPrefix
        attr.prefix = undefined
        // this.namespaceURI = startTag.namespaceURI = this.rootNamespaceURI
      }

      attrs.push(attr)
    }

    // If tag is closed
    if (startTagCloseTagMatch) {
      startTag.unarySlash = startTagCloseTagMatch[1]
      startTag.void = this.activeProcessor.isVoidElement.call(this, startTag)
      startTag.matchEnd = this.moveCursor(startTagCloseTagMatch[0].length)

      const tagPrefix: string = startTagOpenMatch[2]

      if (tagPrefix) {
        const namespaceURI: string = this.namespaceMap[tagPrefix]

        if (null != namespaceURI) {
          this.namespaceURI = startTag.namespaceURI = namespaceURI
        } else if (!this.options.suppressWarnings) {
          this.warn(`Namespace not found for tag prefix: ${tagPrefix}`, {
            matchStart: this.cursor,
            matchEnd: this.cursor + tagPrefix.length,
          })
        }
      }

      return startTag
    } else {
      if (!this.options.suppressWarnings) {
        // When a tag starts with "<abc<" (just the example)
        this.warn(
          `Mal-formatted tag${
            this.tagStack.length ? '' : ' at end of template'
          }: <${startTag.name}`,
          {
            matchStart: startTag.matchStart,
            matchEnd: this.cursor,
          }
        )
      }

      this.nextToken()
    }
  }

  parseEndTag(): EndTag | void {
    const endTagMatch: RegExpMatchArray | null = this.source.match(endTagRegExp)

    if (!endTagMatch) {
      return
    }

    const tagName: string = endTagMatch[1]

    if (!tagName) {
      this.moveCursor(endTagMatch[0].length)
      this.nextToken()

      return
    }

    const tagNameLowerCased: string = tagName.toLowerCase()
    let [tagPrefix, tagLocalName] = tagNameLowerCased.split(':', 2)
    let lastIndex

    if (!tagLocalName) {
      tagLocalName = tagPrefix
      tagPrefix = undefined!
    }

    // Find the closest opened tag of the same type
    for (lastIndex = this.tagStack.length - 1; lastIndex >= 0; --lastIndex) {
      if (tagNameLowerCased === this.tagStack[lastIndex].nameLowerCased) {
        // Switch processor back before foreign tag
        if (
          this.rootTagStack.length &&
          this.tagStack[lastIndex].nameLowerCased ===
            this.rootTagStack[this.rootTagStack.length - 1].nameLowerCased
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

      const endTag: EndTag = {
        name: tagName,
        prefix: tagPrefix,
        localName: tagLocalName,
        nameLowerCased: tagNameLowerCased,
        matchStart: this.cursor,
        matchEnd: this.cursor + endTagMatch[0].length,
      }

      // Remove the open elements from the stack
      this.tagStack.length = lastIndex
      this.moveCursor(endTagMatch[0].length)

      return endTag
    } else {
      return this.activeProcessor.matchingStartTagMissed.call(this, {
        name: tagName,
        prefix: tagPrefix,
        localName: tagLocalName,
        nameLowerCased: tagNameLowerCased,
        matchStart: this.cursor,
        matchEnd: this.cursor + endTagMatch[0].length,
      })
    }
  }

  parseComment(): Content | void {
    return this.parseSection(commentRegExp)
  }

  parseCDataSection(): Content | void {
    return this.parseSection(cDataSectionRegExp)
  }

  parseText(): Content | void {
    let textEndTokenIndex: number = this.source.indexOf('<')
    let textContent: string | undefined

    if (textEndTokenIndex >= 0) {
      let rest = this.source.slice(textEndTokenIndex)
      let ignoreCharIndex

      // Do not treat character "<" in plain text as parser instruction
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
        content: textContent,
        matchStart: this.cursor,
        matchEnd: this.cursor + textContent.length,
      }

      this.moveCursor(textContent.length)

      return text
    }
  }

  tagOpened(startTag: StartTag): void {
    this.tagStack.push(startTag)
  }

  start(type: string) {
    for (const module of this.moduleList) {
      module.start(type)
    }
  }

  end(): void {
    for (const module of this.moduleList) {
      module.end()
    }
  }

  warn(message: string, matchRange: MatchRange) {
    for (const module of this.moduleList) {
      module.warn(message, matchRange)
    }
  }

  processingInstruction<T extends Content>(processingInstruction: T): void {
    for (const module of this.moduleList) {
      module.processingInstruction(processingInstruction)
    }
  }

  declaration<T extends Content>(declaration: T): void {
    for (const module of this.moduleList) {
      module.declaration(declaration)
    }
  }

  startTag<T extends StartTag>(startTag: T): void {
    // We don't have namespace from closest foreign element
    if (
      null == this.namespaceURI &&
      this.rootTagStack.length &&
      !this.rootTagStack[this.rootTagStack.length - 1].namespaceURI
    ) {
      if (!this.options.suppressWarnings) {
        this.warn(
          `<${startTag.name}> element is not allowed in context of <${
            this.rootTagStack[this.rootTagStack.length - 1].name
          }> element without namespace.`,
          {
            matchStart: startTag.matchStart,
            matchEnd: startTag.matchEnd,
          }
        )

        this.useProcessor((this.namespaceURI = this.defaultNamespaceURI))
      }
    }

    // Add start tag to the stack of opened tags
    if (!startTag.void) {
      this.activeProcessor.tagOpened.call(this, startTag)
    }

    for (const module of this.moduleList) {
      module.startTag(startTag)
    }

    startTag.attrs.forEach((attr: Attr) => {
      this.attribute(attr, startTag)
    })

    if (startTag.void) {
      this.endTag(startTag)
    }

    this.nextToken()
  }

  attribute<T extends Attr, U extends StartTag>(attr: T, startTag: U): void {
    for (const module of this.moduleList) {
      module.attribute(attr, startTag)
    }
  }

  endTag<T extends EndTag>(endTag: T): void {
    for (const module of this.moduleList) {
      module.endTag(endTag)
    }

    this.nextToken()
  }

  text<T extends Content>(text: T) {
    for (const module of this.moduleList) {
      module.text(text)
    }
  }

  comment<T extends Content>(comment: T) {
    if (!this.options.suppressComments) {
      for (const module of this.moduleList) {
        module.comment(comment)
      }
    }
  }

  cDataSection<T extends Content>(cDATASection: T): void {
    for (const module of this.moduleList) {
      module.cDataSection(cDATASection)
    }
  }
}
