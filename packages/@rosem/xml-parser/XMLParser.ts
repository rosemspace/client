//todo
// - make common method for content parsing
// - change match interface to `matchStart` and `matchLength`
// - remove warning about optional element closing
// - switch parser functionality
// - add instruction list functionality
// - add middleware functionality
// - migrate extension from mime types to namespaces

import isProduction from '@rosem-util/env/isProduction'
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
} from '@rosem-util/syntax-xml'
import { APPLICATION_XML_MIME_TYPE } from '@rosem-util/w3/mimeTypes'
import { XML_NAMESPACE, XMLNS_NAMESPACE } from '@rosem-util/w3/namespaces'
import HookList from './HookList'
import Processor, { ProcessorMap } from '@rosem/xml-parser/Processor'
import MatchRange from './node/MatchRange'
import ParsedAttr from './node/ParsedAttr'
import ParsedContent from './node/ParsedContent'
import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'
import decodeAttrEntities from './decodeAttrEntities'

const isNotProduction = !isProduction
const defaultOptions: XMLParserOptions = {
  decodeNewlines: false,
  decodeNewlinesForHref: false,
  keepComments: true,
}

export type XMLParserOptions = {
  decodeNewlines: boolean
  decodeNewlinesForHref: boolean
  keepComments: boolean
}

type ParsingInstruction<T extends MatchRange> = () => T | void
type ParsingHook<T extends MatchRange> = <U extends T>(parsedNode: U) => void

export default class XMLParser implements Processor {
  protected readonly defaultNamespaceURI: string = XML_NAMESPACE
  protected namespaceURI: string = XML_NAMESPACE
  protected readonly options: XMLParserOptions
  protected readonly processorMap: ProcessorMap
  protected activeProcessor: Processor = this
  protected readonly moduleList: HookList[] = []
  protected readonly instructionList: [
    ParsingInstruction<ParsedStartTag | ParsedEndTag | ParsedContent>,
    ParsingHook<ParsedStartTag | ParsedEndTag | ParsedContent>
  ][] = [
    [
      this.parseProcessingInstruction,
      this.processingInstruction as ParsingHook<ParsedContent>,
    ],
    [this.parseComment, this.comment as ParsingHook<ParsedContent>],
    [this.parseCDataSection, this.cDataSection as ParsingHook<ParsedContent>],
    [this.parseDeclaration, this.declaration as ParsingHook<ParsedContent>],
    [this.parseEndTag, this.endTag as ParsingHook<ParsedEndTag>],
    [this.parseStartTag, this.startTag as ParsingHook<ParsedStartTag>],
    [this.parseText, this.text as ParsingHook<ParsedContent>],
  ]
  protected instructionIndex: number = 0
  protected typeMap: { [type: string]: string } = {
    [APPLICATION_XML_MIME_TYPE]: XML_NAMESPACE,
  }
  protected readonly namespaceMap: { [namespacePrefix: string]: string } = {
    xml: XML_NAMESPACE,
    xmlns: XMLNS_NAMESPACE,
  }
  protected source: string = ''
  // protected lastSource: string = ''
  protected cursor: number = 0
  protected readonly rootTagStack: ParsedStartTag[] = []
  protected readonly tagStack: ParsedStartTag[] = []

  constructor(options?: XMLParserOptions, processorMap?: ProcessorMap) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    }
    this.processorMap = processorMap || {
      [XML_NAMESPACE]: XMLParser.prototype,
    }
  }

  parseFromString(
    source: string,
    type: string = APPLICATION_XML_MIME_TYPE
  ): void {
    this.source = source
    // Clear previous data
    this.cursor = this.rootTagStack.length = this.tagStack.length = 0
    this.useProcessor(this.typeMap[type])
    this.start(type)

    let parsedNode: ParsedContent | ParsedStartTag | ParsedEndTag | void

    while (this.source) {
      for (
        this.instructionIndex = 0;
        this.instructionIndex < this.instructionList.length;
        ++this.instructionIndex
      ) {
        const [parsingInstruction, hook] = this.instructionList[
          this.instructionIndex
        ]

        if ((parsedNode = parsingInstruction.call(this))) {
          hook.call(this, parsedNode)

          break
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
    processor: Processor
  ) {
    this.processorMap[(this.typeMap[associatedType] = namespaceURI)] = processor
  }

  addModule(module: HookList): void {
    this.moduleList.push(module)
  }

  protected addInstruction<
    T extends ParsedStartTag | ParsedEndTag | ParsedContent
  >(
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
    this.instructionIndex = 0
  }

  isForeignElement(tagName: string): boolean {
    return false
  }

  isVoidElement(parsedTag: ParsedStartTag): boolean {
    return Boolean(parsedTag.unarySlash)
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

  matchingStartTagMissed(endTag: ParsedEndTag): ParsedEndTag | void {
    if (isNotProduction) {
      this.warn(`<${endTag.name}> element has no matching start tag`, {
        matchStart: endTag.matchStart,
        matchEnd: endTag.matchEnd,
      })
    }

    this.moveCursor(endTag.matchEnd - endTag.matchStart)
    this.nextToken()
  }

  matchingEndTagMissed(stackTag: ParsedStartTag): ParsedEndTag | void {
    if (isNotProduction) {
      this.warn(`<${stackTag.name}> element has no matching end tag`, {
        matchStart: stackTag.matchStart,
        matchEnd: stackTag.matchEnd,
      })
    }

    this.endTag({
      name: stackTag.name,
      nameLowerCased: stackTag.nameLowerCased,
      matchStart: this.cursor,
      matchEnd: this.cursor,
    })
  }

  protected parseSection(regExp: RegExp): ParsedContent | void {
    const contentMatch: RegExpMatchArray | null = this.source.match(regExp)

    if (contentMatch) {
      const parsedContent: ParsedContent = {
        content: contentMatch[1],
        matchStart: this.cursor,
        matchEnd: this.cursor + contentMatch[0].length,
      }

      this.moveCursor(contentMatch[0].length)

      return parsedContent
    }
  }

  protected parseProcessingInstruction(): ParsedContent | void {
    return this.parseSection(processingInstructionRegExp)
  }

  protected parseDeclaration(): ParsedContent | void {
    return this.parseSection(declarationRegExp)
  }

  protected parseStartTag(): ParsedStartTag | void {
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
    const attrs: ParsedAttr[] = []
    const parsedTag: ParsedStartTag = {
      name: tagName,
      nameLowerCased: tagNameLowerCased,
      namespaceURI: this.namespaceURI, //||
      // (this.namespaceURI =
      //   this.namespaceMap[tagNameLowerCased] || this.defaultNamespaceURI),
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
      // Full name of an attribute, i. e. "xlink:href"
      const attrNameLowerCased = attrMatch[1].toLowerCase()
      // Local name of an attribute, i. e. "xlink" (before ":")
      let [attrPrefix, attrLocalName] = attrNameLowerCased.split(':')
      const attr: ParsedAttr = {
        name: attrMatch[1],
        nameLowerCased: attrNameLowerCased,
        namespaceURI: '',
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

      // todo: ns:name
      // 1. if tagStack is empty parse namespaces on root element.
      // 2. parse xmlns:prefix and add prefix to root tag namespaceMap
      // 3. parse xmlns and set namespace to its value
      // Add namespace
      if ('xmlns' === attrPrefix) {
        if (attrLocalName) {
          this.addNamespace(attrLocalName, attr.value)
        } else {
          this.addNamespace(
            tagNameLowerCased,
            (this.namespaceURI = parsedTag.namespaceURI = attr.value)
          )
        }
      } else if (attrLocalName) {
        // Add namespace of attribute
        if (
          !(attr.namespaceURI = this.namespaceMap[attrPrefix] || '') &&
          isNotProduction
        ) {
          this.warn(`Namespace not found for attribute prefix: ${attrPrefix}`, {
            matchStart: attr.matchStart,
            matchEnd: attr.matchStart + attrPrefix.length,
          })
        }
      } else {
        attr.localName = attrPrefix
        attr.prefix = ''
      }

      attrs.push(attr)
    }

    // If tag is closed
    if (startTagCloseTagMatch) {
      parsedTag.unarySlash = startTagCloseTagMatch[1]
      parsedTag.matchEnd = this.moveCursor(startTagCloseTagMatch[0].length)

      let tagPrefix: string = startTagOpenMatch[2]

      if (tagPrefix) {
        let namespaceURI: string

        if ((namespaceURI = this.namespaceMap[tagPrefix])) {
          this.namespaceURI = parsedTag.namespaceURI = namespaceURI
        } else if (isNotProduction) {
          this.warn(`Namespace not found for tag prefix: ${tagPrefix}`, {
            matchStart: this.cursor,
            matchEnd: this.cursor + tagPrefix.length,
          })
        }
      }

      return parsedTag
    } else {
      // todo
    }
  }

  protected parseEndTag(): ParsedEndTag | void {
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
    let lastIndex // = 0

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

          if (this.rootTagStack.length) {
            const previousRootTag: ParsedStartTag = this.rootTagStack[
              this.rootTagStack.length - 1
            ]

            this.useProcessor(
              (this.namespaceURI =
                previousRootTag.namespaceURI || this.defaultNamespaceURI)
            )
          } else {
            this.useProcessor((this.namespaceURI = this.defaultNamespaceURI))
          }
        }

        break
      }
    }

    // todo: maybe just ">"?
    if (lastIndex >= 0) {
      // Close all the open elements, up the stack
      for (let index = this.tagStack.length - 1; index > lastIndex; --index) {
        this.activeProcessor.matchingEndTagMissed.call(
          this,
          this.tagStack[index]
        )
      }

      const parsedEndTag: ParsedEndTag = {
        name: tagName,
        nameLowerCased: tagNameLowerCased,
        matchStart: this.cursor,
        matchEnd: this.cursor + endTagMatch[0].length,
      }

      // Remove the open elements from the stack
      this.tagStack.length = lastIndex
      this.moveCursor(endTagMatch[0].length)

      return parsedEndTag
    } else {
      return this.activeProcessor.matchingStartTagMissed.call(this, {
        name: tagName,
        nameLowerCased: tagNameLowerCased,
        matchStart: this.cursor,
        matchEnd: this.cursor + endTagMatch[0].length,
      })
    }
  }

  protected parseComment(): ParsedContent | void {
    return this.parseSection(commentRegExp)
  }

  protected parseCDataSection(): ParsedContent | void {
    return this.parseSection(cDataSectionRegExp)
  }

  protected parseText(): ParsedContent | void {
    let textEndTokenIndex: number = this.source.indexOf('<')
    let textContent: string | undefined

    if (textEndTokenIndex >= 0) {
      let rest = this.source.slice(textEndTokenIndex)
      let ignoreCharIndex

      if (textEndTokenIndex === 0) {
        debugger
      }

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
      // this.source = '' // todo: we need it?
    }

    // Ensure we don't have an empty string
    if (textContent) {
      const parsedText: ParsedContent = {
        content: textContent,
        matchStart: this.cursor,
        matchEnd: this.cursor + textContent.length,
      }

      this.moveCursor(textContent.length)
      // this.lastSource = this.source

      return parsedText
      // } else if (this.source.length === this.lastSource.length) {
    } else if (!textEndTokenIndex) {
      // const textEndTokenIndex: number = this.source.slice(1).indexOf('<')
      const parsedText: ParsedContent = {
        content: this.source,
        matchStart: this.cursor,
        matchEnd: this.cursor + this.source.length,
      }

      // When a template ends with "<..." (just the example)
      if (isNotProduction && !this.tagStack.length) {
        this.warn(`Mal-formatted tag at end of template: "${this.source}"`, {
          matchStart: this.cursor,
          matchEnd: this.cursor + this.source.length,
        })
      }

      this.moveCursor(this.source.length)
      // this.lastSource = this.source

      return parsedText
    } else {
      // todo
    }
  }

  public start(type: string) {
    for (const module of this.moduleList) {
      module.start(type)
    }
  }

  public end(): void {
    for (const module of this.moduleList) {
      module.end()
    }
  }

  public warn(message: string, matchRange: MatchRange) {
    for (const module of this.moduleList) {
      module.warn(message, matchRange)
    }
  }

  public processingInstruction<T extends ParsedContent>(
    parsedProcessingInstruction: T
  ): void {
    for (const module of this.moduleList) {
      module.processingInstruction(parsedProcessingInstruction)
    }
  }

  public declaration<T extends ParsedContent>(declaration: T): void {
    for (const module of this.moduleList) {
      module.declaration(declaration)
    }
  }

  public startTag<T extends ParsedStartTag>(parsedStartTag: T): void {
    const tagNameLowerCased = parsedStartTag.nameLowerCased

    // We don't have namespace from closest foreign element
    if (
      !this.namespaceURI &&
      this.rootTagStack.length &&
      !this.rootTagStack[this.rootTagStack.length - 1].namespaceURI
    ) {
      if (isNotProduction) {
        this.warn(
          `<${parsedStartTag.name}> element is not allowed in context of <${
            this.rootTagStack[this.rootTagStack.length - 1].name
          }> element without namespace.`,
          {
            matchStart: parsedStartTag.matchStart,
            matchEnd: parsedStartTag.matchEnd,
          }
        )
        this.useProcessor((this.namespaceURI = this.defaultNamespaceURI))
      }

      // this.namespaceURI = parsedStartTag.namespaceURI = ''
      // // Use default processor when a user didn't specify a namespace
      // this.useProcessor()
    }

    // Add start tag to the stack of opened tags
    if (
      !(parsedStartTag.void = this.activeProcessor.isVoidElement.call(
        this,
        parsedStartTag
      ))
    ) {
      this.tagStack.push(parsedStartTag)

      // Switch parser for foreign tag
      if (
        // !this.rootTagStack.length ||
        this.activeProcessor.isForeignElement.call(this, tagNameLowerCased)
      ) {
        if (!parsedStartTag.void) {
          this.rootTagStack.push(parsedStartTag)
          this.useProcessor(
            (this.namespaceURI = parsedStartTag.namespaceURI =
              this.namespaceMap[tagNameLowerCased] || '') ||
              this.defaultNamespaceURI
          )

          // if (this.namespaceMap[tagNameLowerCased]) {
          //   this.useProcessor(this.namespaceURI)
          // } else {
          //   this.namespaceURI = ''
          // }
        }

        // debugger // if `foreignObject`
        // if (this.namespaceMap[tagNameLowerCased]) {
        //   this.useProcessor(
        //     (this.namespaceURI = parsedStartTag.namespaceURI =
        //       this.namespaceMap[tagNameLowerCased])// || this.namespaceURI)
        //   )
        // } else if (this.namespaceURI) {
        // this.useProcessor(this.namespaceURI)
        // } else {
        //   this.namespaceURI = ''
        //   this.useProcessor()
        // }
      }
    }

    for (const module of this.moduleList) {
      module.startTag(parsedStartTag)
    }
  }

  public endTag<T extends ParsedEndTag>(parsedEndTag: T): void {
    for (const module of this.moduleList) {
      module.endTag(parsedEndTag)
    }
  }

  public text<T extends ParsedContent>(parsedText: T) {
    for (const module of this.moduleList) {
      module.text(parsedText)
    }
  }

  public comment<T extends ParsedContent>(parsedComment: T) {
    if (this.options.keepComments) {
      for (const module of this.moduleList) {
        module.comment(parsedComment)
      }
    }
  }

  public cDataSection<T extends ParsedContent>(parsedCDATASection: T): void {
    for (const module of this.moduleList) {
      module.cDataSection(parsedCDATASection)
    }
  }
}
