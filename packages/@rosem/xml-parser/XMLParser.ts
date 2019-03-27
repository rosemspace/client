//todo
// - make common method for content parsing
// - change match interface to `matchStart` and `matchLength`
// - remove warning about optional element closing
// - switch parser functionality
// - add instruction list functionality
// - add middleware functionality

import isProduction from '@rosem-util/env/isProduction'
import {
  commentStartRegExp,
  cDataSectionStartRegExp,
  endTagRegExp,
  startTagOpenRegExp,
  startTagCloseRegExp,
  attributeRegExp,
  qualifiedNameRegExp,
  processingInstructionRegExp,
  processingInstructionStartRegExp,
  commentRegExp,
  cDataSectionRegExp,
} from '@rosem-util/syntax-xml'
import MatchRange from '@rosem/xml-parser/node/MatchRange'
import decodeAttrEntities from './decodeAttrEntities'
import WarningData from './WarningData'
import HookList, { ParsingHook } from './HookList'
import namespaceMap from './namespaceMap'
import ParsedAttr from './node/ParsedAttr'
import ParsedContent from './node/ParsedContent'
import ParsedEndTag from './node/ParsedEndTag'
import ParsedStartTag from './node/ParsedStartTag'

const isNotProduction = !isProduction
const defaultOptions: TemplateParserOptions = {
  decodeNewlines: false,
  decodeNewlinesForHref: false,
  keepComments: true,
}

export type TemplateParserOptions = {
  decodeNewlines: boolean
  decodeNewlinesForHref: boolean
  keepComments: boolean
}

type ParsingMiddleware<T extends MatchRange> = () => T | void

export default class XMLParser implements HookList {
  protected readonly options: TemplateParserOptions
  protected readonly moduleList: HookList[] = []
  protected instructionList: [
    ParsingMiddleware<ParsedStartTag | ParsedEndTag | ParsedContent>,
    ParsingHook<ParsedStartTag | ParsedEndTag | ParsedContent>
  ][]
  protected type: string = 'application/xml'
  protected namespace?: string
  protected source: string = ''
  protected lastSource: string = ''
  protected cursor: number = 0
  protected tagStack: ParsedStartTag[] = []

  constructor(options?: TemplateParserOptions) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    }
    this.instructionList = [
      [this.parseProcessingInstruction, this.processingInstruction],
      [this.parseComment, this.comment],
      [this.parseCDataSection, this.cDataSection],
      [this.parseEndTag, this.endTag],
      [this.parseStartTag, this.startTag],
      [this.parseText, this.text],
    ]
  }

  addInstruction<T extends ParsedStartTag | ParsedEndTag | ParsedContent>(
    parse: ParsingMiddleware<T>,
    handle: ParsingHook<T>,
    order: number = this.instructionList.length - 1
  ) {
    this.instructionList.splice(order, 0, [parse, handle])
  }

  addModule(module: HookList): void {
    this.moduleList.push(module)
  }

  parseFromString(source: string): void {
    this.source = source
    // Clear previous data
    this.tagStack = []
    this.cursor = 0
    this.start(this.type)

    let parsedNode: ParsedContent | ParsedStartTag | ParsedEndTag | void

    while (this.source) {
      for (const [middleware, hook] of this.instructionList) {
        if ((parsedNode = middleware.call(this))) {
          hook.call(this, parsedNode)

          break
        }
      }
    }

    // Clean up any remaining tags
    // this.parseEndTag(['', '']) // todo
    this.end()
  }

  protected moveCursor(n: number) {
    this.cursor += n
    this.source = this.source.slice(n)
  }

  protected parseContent(regExp: RegExp): ParsedContent | void {
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
    return this.parseContent(processingInstructionRegExp)
  }

  protected parseStartTag(): ParsedStartTag | void {
    const startTagOpenMatch: RegExpMatchArray | null = this.source.match(
      startTagOpenRegExp
    )

    if (!startTagOpenMatch) {
      return
    }

    const tagName = startTagOpenMatch[1]
    const tagNameLowerCased = tagName.toLowerCase()
    const attrs: ParsedAttr[] = []
    const parsedTag: ParsedStartTag = {
      name: tagName,
      nameLowerCased: tagNameLowerCased,
      namespace:
        this.namespace || (this.namespace = namespaceMap[tagNameLowerCased]),
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
      const cursor = this.cursor
      // Full attribute name, i. e. "xlink:href"
      const attrNameLowerCased = attrMatch[1].toLowerCase()
      // Non-colonized attribute name, i. e. "xlink" (before ":")
      const attrNcNameLowerCased = attrNameLowerCased.replace(
        qualifiedNameRegExp,
        '$1'
      )

      this.moveCursor(attrMatch[0].length)

      const attr: ParsedAttr = {
        name: attrMatch[1],
        nameLowerCased: attrNameLowerCased,
        value: decodeAttrEntities(
          attrMatch[3] || attrMatch[4] || attrMatch[5] || '',
          'a' === tagNameLowerCased && 'href' === attrNameLowerCased
            ? this.options.decodeNewlinesForHref
            : this.options.decodeNewlines
        ),
        matchStart:
          cursor + (attrMatch[0].match(/^\s*/) as RegExpMatchArray).length,
        matchEnd: this.cursor,
      }

      // todo: ns:name
      // 1. if tagStack is empty parse namespaces on root element.
      // 2. parse xmlns:prefix and add prefix to root tag namespaceMap
      // 3. parse xmlns and set namespace to its value
      // Add namespace of tags
      if ('xmlns' === attrNameLowerCased) {
        this.namespace = parsedTag.namespace = attr.value
      }

      // Add namespace of attribute
      if (attrNcNameLowerCased) {
        const attrNamespace = namespaceMap[attrNcNameLowerCased]

        if (attrNamespace) {
          attr.namespace = attrNamespace
        }
      }

      attrs.push(attr)
    }

    // If tag is closed
    if (startTagCloseTagMatch) {
      parsedTag.unarySlash = startTagCloseTagMatch[1]

      if (!(parsedTag.void = this.isVoidTag(parsedTag))) {
        this.tagStack.push(parsedTag)
      }

      this.moveCursor(startTagCloseTagMatch[0].length)
      parsedTag.matchEnd = this.cursor

      return parsedTag
    }
  }

  protected parseEndTag(): ParsedEndTag | void {
    const endTagMatch: RegExpMatchArray | null = this.source.match(endTagRegExp)

    if (!endTagMatch) {
      return
    }

    const tagName: string = endTagMatch[1]
    const tagNameLowerCased: string = tagName.toLowerCase()
    let lastIndex // = 0

    // Find the closest opened tag of the same type
    // if (tagName) {
    for (lastIndex = this.tagStack.length - 1; lastIndex >= 0; --lastIndex) {
      if (tagNameLowerCased === this.tagStack[lastIndex].nameLowerCased) {
        this.matchingStartTagFound(this.tagStack[lastIndex])

        break
      }
    }
    // }

    // todo: maybe just ">"?
    if (lastIndex >= 0) {
      // Close all the open elements, up the stack
      for (let index = this.tagStack.length - 1; index > lastIndex; --index) {
        const stackTag = this.tagStack[index]

        if (isNotProduction && (index > lastIndex || !tagName)) {
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
      this.matchingStartTagMissed({
        name: tagName,
        nameLowerCased: tagNameLowerCased,
        matchStart: this.cursor,
        matchEnd: this.cursor + endTagMatch[0].length,
      })
      this.moveCursor(endTagMatch[0].length)
    }
  }

  protected parseComment(): ParsedContent | void {
    return this.parseContent(commentRegExp)
  }

  protected parseCDataSection(): ParsedContent | void {
    return this.parseContent(cDataSectionRegExp)
  }

  protected parseText(): ParsedContent | void {
    let textEndTokenIndex: number = this.source.indexOf('<')
    let textContent: string | undefined

    if (textEndTokenIndex >= 0) {
      let rest = this.source.slice(textEndTokenIndex)
      let ignoreCharIndex

      // Do not treat character "<" in plain text as parser instruction
      while (
        !this.startsWithInstruction(rest) &&
        (ignoreCharIndex = rest.indexOf('<', 1)) >= 0
      ) {
        textEndTokenIndex += ignoreCharIndex
        rest = this.source.slice(textEndTokenIndex)
      }

      textContent = this.source.slice(0, textEndTokenIndex)
    } else {
      textContent = this.source
      this.source = '' // todo: we need it?
    }

    // Ensure we don't have an empty string
    if (textContent) {
      const parsedText: ParsedContent = {
        content: textContent,
        matchStart: this.cursor,
        matchEnd: this.cursor + textContent.length,
      }

      this.moveCursor(textContent.length)
      this.lastSource = this.source

      return parsedText
    } else if (this.source.length === this.lastSource.length) {
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
      this.lastSource = this.source

      return parsedText
    }
  }

  protected isVoidTag(parsedTag: ParsedStartTag): boolean {
    return Boolean(parsedTag.unarySlash)
  }

  protected startsWithInstruction(source: string): boolean {
    return (
      processingInstructionStartRegExp.test(source) ||
      commentStartRegExp.test(source) ||
      cDataSectionStartRegExp.test(source) ||
      endTagRegExp.test(source) ||
      startTagOpenRegExp.test(source)
    )
  }

  protected matchingStartTagFound(startTag: ParsedStartTag): void {}

  protected matchingStartTagMissed(endTag: ParsedEndTag): void {
    if (isNotProduction) {
      this.warn(`<${endTag.name}> element has no matching start tag`, {
        matchStart: endTag.matchStart,
        matchEnd: endTag.matchEnd,
      })
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

  public processingInstruction: ParsingHook<ParsedContent> = (
    parsedProcessingInstruction: ParsedContent
  ): void => {
    for (const module of this.moduleList) {
      module.processingInstruction(parsedProcessingInstruction)
    }
  }

  public startTag: ParsingHook<ParsedStartTag> = (
    parsedTag: ParsedStartTag
  ): void => {
    for (const module of this.moduleList) {
      module.startTag(parsedTag)
    }
  }

  public endTag: ParsingHook<ParsedEndTag> = (
    parsedEndTag: ParsedEndTag
  ): void => {
    for (const module of this.moduleList) {
      module.endTag(parsedEndTag)
    }
  }

  public text: ParsingHook<ParsedContent> = (
    parsedText: ParsedContent
  ): void => {
    for (const module of this.moduleList) {
      module.text(parsedText)
    }
  }

  public comment: ParsingHook<ParsedContent> = (
    parsedComment: ParsedContent
  ): void => {
    if (this.options.keepComments) {
      for (const module of this.moduleList) {
        module.comment(parsedComment)
      }
    }
  }

  public cDataSection: ParsingHook<ParsedContent> = (
    parsedCDATASection: ParsedContent
  ): void => {
    for (const module of this.moduleList) {
      module.cDataSection(parsedCDATASection)
    }
  }

  public warn(message: string, data: WarningData) {
    for (const module of this.moduleList) {
      module.warn(message, data)
    }
  }
}
