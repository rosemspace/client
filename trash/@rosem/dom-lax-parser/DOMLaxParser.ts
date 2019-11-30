import WarningData from '@rosem/dom-lax-parser/WarningData'
import { startsWith, trimStart } from 'lodash-es'
import no from '@rosem-util/common/no'
import isProduction from '@rosem-util/env/isProduction'
import {
  doctypeDeclarationRegExp,
  isAnyRawTextElement,
  shouldIgnoreFirstNewline,
} from '@rosem-util/syntax-html'
import {
  characterDataSectionStartToken,
  characterDataSectionEndToken,
  conditionalCommentStartToken,
  conditionalCommentEndToken,
  commentStartToken,
  commentEndToken,
  commentStartRegExp,
  cDataSectionStartRegExp,
  conditionalCommentStartRegExp,
  endTagRegExp,
  startTagOpenRegExp,
  commentRegExp,
  xmlDeclarationRegExp,
  startTagCloseRegExp,
  attributeRegExp,
  qualifiedNameRegExp,
  cDataSectionRegExp,
} from '@rosem-util/syntax-xml'
import ParsedAttr from './ParsedAttr'
import ParsedContent from './ParsedContent'
import ParsedEndTag from './ParsedEndTag'
import ParsedStartTag from './ParsedStartTag'
import getStackedTagRegExp from './getStackedTagRegExp'
import isEscapableRawHTMLTextElement from './html/isEscapableRawTextElement'
import isForeignHTMLTag from './html/isForeignElement'
import isForeignSVGElement from './svg/isForeignElement'
import isNonPhrasingHTMLElement from './html/isNonPhrasingElement'
import isOptionalClosingHTMLElement from './html/isOptionalClosingElement'
import isRawTextElement from './isRawTextElement'
import isVoidHTMLElement from './html/isVoidElement'
import { decodeAttrEntities } from './attrEntities'
import namespaceMap from './namespaceMap'
import ModuleInterface from './ModuleInterface'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  APPLICATION_XHTML_XML_MIME_TYPE,
  APPLICATION_XML_MIME_TYPE,
  IMAGE_SVG_XML_MIME_TYPE,
  typeMap,
  SourceSupportedType,
  TEXT_HTML_MIME_TYPE,
} from './typeMap'

const commentStartTokenLength = commentStartToken.length // <!--
const commentEndTokenLength = commentEndToken.length // -->
const characterDataSectionStartTokenLength =
  characterDataSectionStartToken.length // <![CDATA[
const characterDataSectionEndTokenLength = characterDataSectionEndToken.length // ]]>
const conditionalCommentStartTokenLength = conditionalCommentStartToken.length // <![
const conditionalCommentEndTokenLength = conditionalCommentEndToken.length // ]>

export type TemplateParserOptions = {
  decodeNewlines: boolean
  decodeNewlinesForHref: boolean
  keepComments: boolean
}

type IsElement = (tag: string) => boolean

const isNotProduction = !isProduction
const defaultOptions: TemplateParserOptions = {
  decodeNewlines: false,
  decodeNewlinesForHref: false,
  keepComments: true,
}

export default class DOMLaxParser implements ModuleInterface {
  protected readonly options: TemplateParserOptions
  protected readonly moduleList: ModuleInterface[] = []
  protected type?: SourceSupportedType
  protected namespace?: string
  protected source: string = ''
  protected cursor: number = 0
  protected tagStack: ParsedStartTag[] = []
  protected rootTagStack: ParsedStartTag[] = []
  protected lastSource: string = ''
  protected lastTagNameLowerCased: string = ''
  protected isEscapableRawTextElement: IsElement = no
  protected isForeignElement: IsElement = no
  protected isNonPhrasingElement: IsElement = no
  protected isOptionalClosingElement: IsElement = no
  protected isRawTextElement: IsElement = no
  protected isVoidElement: IsElement = no

  constructor(options?: TemplateParserOptions) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    }
  }

  static getStackedTagRegExp: (tagName: string) => RegExp = getStackedTagRegExp

  addModule(module: ModuleInterface): void {
    this.moduleList.push(module)
  }

  protected switchParser(type: SourceSupportedType = 'text/html'): void {
    if (type === this.type) {
      return
    }

    this.type = type
    this.isEscapableRawTextElement = this.isForeignElement = this.isNonPhrasingElement = this.isOptionalClosingElement = this.isRawTextElement = this.isVoidElement = no

    // noinspection FallThroughInSwitchStatementJS
    switch (type) {
      case APPLICATION_XML_MIME_TYPE:
      case APPLICATION_MATHML_XML_MIME_TYPE:
        break
      case TEXT_HTML_MIME_TYPE:
        this.isOptionalClosingElement = isOptionalClosingHTMLElement
      case APPLICATION_XHTML_XML_MIME_TYPE:
        this.isEscapableRawTextElement = isEscapableRawHTMLTextElement
        this.isForeignElement = isForeignHTMLTag
        this.isNonPhrasingElement = isNonPhrasingHTMLElement
        this.isRawTextElement = isRawTextElement
        this.isVoidElement = isVoidHTMLElement // todo: XHTML

        break
      case IMAGE_SVG_XML_MIME_TYPE:
        this.isForeignElement = isForeignSVGElement
        this.isRawTextElement = isRawTextElement

        break
      default:
        throw new TypeError(`Unsupported source MIME type: ${type}`)
    }
  }

  parseFromString(
    source: string,
    type: SourceSupportedType = 'text/html'
  ): void {
    // Clear previous data
    this.tagStack = []
    this.rootTagStack = []
    this.cursor = 0
    this.source = trimStart(source)
    this.switchParser(type)
    this.parseXMLDeclaration()
    this.parseDoctype()

    while (this.source) {
      this.lastSource = this.source

      // Make sure we're not in a raw text element like <script>, <style>,
      // <textarea> or <title>
      if (!isAnyRawTextElement(this.lastTagNameLowerCased)) {
        let textEndTokenIndex: number = this.source.indexOf('<')

        // We have no text, so will be searching for doctype/tag/comment
        if (0 === textEndTokenIndex) {
          // Comment:
          // if (this.startsWith(commentStartToken)) {
          if (commentStartRegExp.test(this.source)) {
            const commentEndTokenIndex = this.source.indexOf(commentEndToken)

            // If comment have end token
            if (commentEndTokenIndex >= commentStartTokenLength) {
              if (this.options.keepComments) {
                this.comment({
                  content: this.source.slice(
                    commentStartTokenLength,
                    commentEndTokenIndex
                  ),
                  matchStart: this.cursor,
                  matchEnd:
                    this.cursor + commentEndTokenIndex + commentEndTokenLength,
                })
              }

              this.moveCursor(commentEndTokenIndex + commentEndTokenLength)

              continue
            }
          }

          // Character data section:
          if (cDataSectionStartRegExp.test(this.source)) {
            const characterDataSectionEndTokenIndex = this.source.indexOf(
              characterDataSectionEndToken
            )

            // If CDATA section have end token
            if (
              characterDataSectionEndTokenIndex >= characterDataSectionStartTokenLength
            ) {
              this.cDataSection({
                content: this.source.slice(
                  characterDataSectionStartTokenLength,
                  characterDataSectionEndTokenIndex
                ),
                matchStart: this.cursor,
                matchEnd:
                  this.cursor +
                  characterDataSectionEndTokenIndex +
                  characterDataSectionEndTokenLength,
              })
            }
          }

          // Conditional comment:
          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
          if (conditionalCommentStartRegExp.test(this.source)) {
            const conditionalCommentEndTokenIndex = this.source.indexOf(
              conditionalCommentEndToken
            )

            // If conditional comment have end token
            if (
              conditionalCommentEndTokenIndex >=
              conditionalCommentStartTokenLength
            ) {
              this.moveCursor(
                conditionalCommentEndTokenIndex +
                  conditionalCommentEndTokenLength
              )

              continue
            }
          }

          // End tag:
          const endTagMatch = this.source.match(endTagRegExp)

          if (endTagMatch) {
            const cursor = this.cursor

            this.moveCursor(endTagMatch[0].length)
            this.parseEndTag(endTagMatch[1], cursor, this.cursor)

            continue
          }

          // Start tag:
          const startTagOpenMatch = this.source.match(startTagOpenRegExp)

          if (startTagOpenMatch) {
            const parsedStartTag = this.parseStartTag(startTagOpenMatch)

            if (parsedStartTag) {
              this.handleStartTag(parsedStartTag)

              if (
                shouldIgnoreFirstNewline(
                  parsedStartTag.nameLowerCased,
                  this.source
                )
              ) {
                this.moveCursor(1)
              }

              continue
            }
          }
        }

        // We have text
        let textContent: string

        if (textEndTokenIndex >= 0) {
          let rest = this.source.slice(textEndTokenIndex)
          let ignoreCharIndex

          // Do not treat character "<" in plain text as parser instruction
          while (
            (ignoreCharIndex = rest.indexOf('<', 1)) >= 0 &&
            !endTagRegExp.test(rest) &&
            !startTagOpenRegExp.test(rest) &&
            !commentStartRegExp.test(rest) &&
            !conditionalCommentStartRegExp.test(rest)
          ) {
            textEndTokenIndex += ignoreCharIndex
            rest = this.source.slice(textEndTokenIndex)
          }

          textContent = this.source.slice(0, textEndTokenIndex)
        } else {
          textContent = this.source
          this.source = ''
        }

        // todo I guess we will always have text
        if (textContent) {
          this.moveCursor(textContent.length)
          this.text({
            content: textContent,
            matchStart: this.cursor - textContent.length,
            matchEnd: this.cursor,
          })
        }
      }
      // We are in a raw text element like <script>, <style>, <textarea> or
      // <title>
      else {
        let endTagLength = 0
        const lastTagLowerCased = this.lastTagNameLowerCased
        const stackedTagRE = getStackedTagRegExp(lastTagLowerCased)
        const rest = this.source.replace(
          stackedTagRE,
          (all: string, text: string, endTag: string): string => {
            endTagLength = endTag.length

            let textContent = text

            if (
              !isAnyRawTextElement(lastTagLowerCased) &&
              'noscript' !== lastTagLowerCased
            ) {
              textContent = textContent
                .replace(commentRegExp, '$1')
                .replace(cDataSectionRegExp, '$1')
            }

            if (shouldIgnoreFirstNewline(lastTagLowerCased, text)) {
              textContent = textContent.slice(1)
            }

            this.text({
              content: textContent,
              matchStart: this.cursor,
              matchEnd: this.cursor + text.length,
            })

            return ''
          }
        )

        this.cursor += this.source.length - rest.length
        this.source = rest

        this.parseEndTag(
          lastTagLowerCased,
          this.cursor - endTagLength,
          this.cursor
        )
      }

      // todo roshe: maybe better to use length?
      if (this.source === this.lastSource) {
        this.text({
          content: this.source,
          matchStart: this.cursor,
          matchEnd: this.cursor + this.source.length,
        })

        // When a template ends with "<..." (just the example)
        if (isNotProduction && !this.tagStack.length) {
          this.warn(`Mal-formatted tag at end of template: "${this.source}"`, {
            matchStart: this.cursor + this.source.length,
            matchEnd: this.cursor + this.source.length,
          })
        }
        break
      }
    }

    // Clean up any remaining tags
    this.parseEndTag('', 0, 0) // todo
  }

  protected moveCursor(n: number) {
    this.cursor += n
    this.source = this.source.slice(n)
  }

  protected parseXMLDeclaration() {
    const xmlDeclarationMatch = this.source.match(xmlDeclarationRegExp)

    if (xmlDeclarationMatch) {
      // Ignore XML declaration and move forward
      this.moveCursor(xmlDeclarationMatch[0].length)
    }
  }

  protected parseDoctype() {
    const doctypeDeclarationMatch = this.source.match(doctypeDeclarationRegExp)

    if (doctypeDeclarationMatch) {
      // Ignore doctype and move forward
      this.moveCursor(doctypeDeclarationMatch[0].length)
    }
  }

  protected parseStartTag(
    startTagOpenMatch: RegExpMatchArray
  ): ParsedStartTag | undefined {
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

    if (startTagCloseTagMatch) {
      parsedTag.unarySlash = startTagCloseTagMatch[1]
      parsedTag.void =
        this.isVoidElement(tagNameLowerCased) ||
        Boolean(startTagCloseTagMatch[1])
      this.moveCursor(startTagCloseTagMatch[0].length)
      parsedTag.matchEnd = this.cursor

      // We don't have namespace from previous tag
      if (
        !this.namespace &&
        this.rootTagStack.length &&
        this.rootTagStack[this.rootTagStack.length - 1].namespace
      ) {
        const rootTag = this.rootTagStack[this.rootTagStack.length - 1]

        this.namespace = parsedTag.namespace = rootTag.namespace

        if (isNotProduction) {
          this.warn(
            `<${parsedTag.name}> element is not allowed in context of <${
              rootTag.name
            }> element without namespace`,
            {
              matchStart: parsedTag.matchStart,
              matchEnd: parsedTag.matchEnd,
            }
          )
        }
      }

      // Switch parser for foreign tag
      if (
        !this.rootTagStack.length ||
        this.isForeignElement(tagNameLowerCased)
      ) {
        this.rootTagStack.push(parsedTag)

        if (typeMap[tagNameLowerCased]) {
          this.switchParser(typeMap[tagNameLowerCased])
          this.namespace = parsedTag.namespace =
            namespaceMap[parsedTag.nameLowerCased] || this.namespace
        } else {
          this.namespace = undefined
        }
      }

      return parsedTag
    }
  }

  protected handleStartTag(parsedTag: ParsedStartTag) {
    const tagNameLowerCased = parsedTag.nameLowerCased

    switch(this.type) {
      case TEXT_HTML_MIME_TYPE:
        if (
          this.lastTagNameLowerCased === 'p' &&
          // this.isOptionalClosingElement(this.lastTagNameLowerCased) &&
          this.isNonPhrasingElement(tagNameLowerCased)
        ) {
          debugger
          this.parseEndTag(this.lastTagNameLowerCased, this.cursor, this.cursor)
        }

        if (
          this.isOptionalClosingElement(tagNameLowerCased) &&
          this.lastTagNameLowerCased === tagNameLowerCased
        ) {
          debugger
          this.parseEndTag(tagNameLowerCased, this.cursor, this.cursor)
        }

        break;
    }

    if (!parsedTag.void) {
      this.tagStack.push(parsedTag)
      this.lastTagNameLowerCased = tagNameLowerCased
    }

    this.tagStart(parsedTag)
  }

  protected parseEndTag(tagName: string, matchStart: number, matchEnd: number) {
    let tagNameLowerCased
    let pos = 0

    // Find the closest opened tag of the same type
    if (tagName) {
      tagNameLowerCased = tagName.toLowerCase()

      for (pos = this.tagStack.length - 1; pos >= 0; --pos) {
        if (this.tagStack[pos].nameLowerCased === tagNameLowerCased) {
          // Switch parser back before foreign tag
          if (
            this.tagStack[pos].nameLowerCased ===
            this.rootTagStack[this.rootTagStack.length - 1].nameLowerCased
          ) {
            this.rootTagStack.pop()

            if (this.rootTagStack.length) {
              const previousRootTag: ParsedStartTag = this.rootTagStack[
                this.rootTagStack.length - 1
              ]

              this.switchParser(typeMap[previousRootTag.nameLowerCased])
              this.namespace = previousRootTag.namespace
            } else {
              this.switchParser()
              this.namespace = undefined
            }
          }

          break
        }
      }
    }

    if (pos >= 0) {
      let index

      // Close all the open elements, up the stack
      for (index = this.tagStack.length - 1; index >= pos; --index) {
        const stackTag = this.tagStack[index]

        if (isNotProduction && (index > pos || !tagName)) {
          this.warn(`<${stackTag.name}> element has no matching end tag.`, {
            matchStart: stackTag.matchStart,
            matchEnd: stackTag.matchEnd,
          })
        }

        this.tagEnd({
          name: stackTag.name,
          nameLowerCased: stackTag.nameLowerCased,
          matchStart,
          matchEnd,
        })
      }

      // Remove the open elements from the stack
      this.tagStack.length = pos
      this.lastTagNameLowerCased =
        pos > 0 ? this.tagStack[pos - 1].nameLowerCased : ''
    } else {
      if (tagNameLowerCased === 'br') {
        debugger
        this.tagStart({
          name: tagName,
          nameLowerCased: tagNameLowerCased,
          namespace: this.namespace,
          attrs: [],
          void: true,
          unarySlash: '',
          matchStart,
          matchEnd,
        })
      } else if (tagNameLowerCased === 'p') {
        debugger
        this.tagStart({
          name: tagName,
          nameLowerCased: tagNameLowerCased,
          namespace: this.namespace,
          attrs: [],
          void: false,
          unarySlash: '',
          matchStart,
          matchEnd,
        })
        this.tagEnd({
          name: tagName,
          nameLowerCased: tagNameLowerCased,
          matchStart,
          matchEnd,
        })
      }
    }
  }

  // moveCursor(length: number = 1): void {
  //   this.cursor += length
  //   // this.source = this.source.slice(length)
  // }
  //
  // startsWith(token: string): boolean {
  //   return startsWith(this.source, token, this.cursor)
  // }
  //
  // getStringBetween(startToken: string, endToken: string): string | undefined {
  //   if (this.startsWith(startToken)) {
  //     const endTokenIndex = this.source.indexOf(endToken, this.cursor)
  //
  //     if (endTokenIndex >= startToken.length) {
  //       this.moveCursor(endTokenIndex + endToken.length)
  //
  //       return this.source.slice(startToken.length, endTokenIndex)
  //     }
  //   }
  // }

  public tagStart(parsedTag: ParsedStartTag) {
    let module

    for (module of this.moduleList) {
      module.tagStart(parsedTag)
    }
  }

  public tagEnd(parsedEndTag: ParsedEndTag) {
    let module

    for (module of this.moduleList) {
      module.tagEnd(parsedEndTag)
    }
  }

  public text(parsedText: ParsedContent) {
    let module

    for (module of this.moduleList) {
      module.text(parsedText)
    }
  }

  public comment(parsedComment: ParsedContent) {
    let module

    for (module of this.moduleList) {
      module.comment(parsedComment)
    }
  }

  public cDataSection(parsedCDATASection: ParsedContent) {
    let module

    for (module of this.moduleList) {
      module.cDataSection(parsedCDATASection)
    }
  }

  public warn(message: string, data: WarningData) {
    let module

    for (module of this.moduleList) {
      module.warn(message, data)
    }
  }
}
