// text and comments nodes should not contain namespaceURI

import no from '@rosem-util/common/no'
import isProduction from '@rosem-util/env/isProduction'
import isEscapableRawHTMLTextElement from './html/isEscapableRawTextElement'
import isForeignHTMLTag from './html/isForeignElement'
import isForeignSVGElement from './svg/isForeignElement'
import isNonPhrasingHTMLElement from './html/isNonPhrasingElement'
import isOptionalClosingHTMLElement from './html/isOptionalClosingElement'
import isRawHTMLTextElement from './html/isRawTextElement'
import isVoidHTMLElement from './html/isVoidElement'
import { decodeAttrEntities } from './mapping/AttrEntityDecodingMap'
import { XML_NAMESPACE_MAP } from './mapping/XMLNamespaceMap'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  APPLICATION_XHTML_XML_MIME_TYPE,
  APPLICATION_XML_MIME_TYPE,
  IMAGE_SVG_XML_MIME_TYPE,
  MIME_TYPE_MAP,
  TEXT_HTML_MIME_TYPE,
  TEXT_XML_MIME_TYPE,
} from './mapping/MIMETypeMap'
import {
  attributeRE,
  COMMENT_END_TOKEN,
  COMMENT_END_TOKEN_LENGTH,
  COMMENT_START_TOKEN_LENGTH,
  commentRE,
  commentStartRE,
  CONDITIONAL_COMMENT_END_TOKEN,
  CONDITIONAL_COMMENT_END_TOKEN_LENGTH,
  conditionalCommentCharacterDataRE,
  conditionalCommentStartRE,
  doctypeDeclarationRE,
  endTagRE,
  qNameRE,
  startTagCloseRE,
  startTagOpenRE,
  xmlDeclarationRE,
} from './syntax'

export type TemplateSupportedType = 'application/mathml+xml' | SupportedType

export type ParsedTag = {
  name: string
  nameLowerCased: string
  namespace?: string
  attrs: Array<ParsedAttribute>
  start: number
  end: number
  void: boolean
  unarySlash: string
}

export type ParsedAttribute = {
  name: string
  nameLowerCased: string
  namespace?: string
  value: string
  start: number
  end: number
}

export type TemplateParserOptions = {
  decodeNewlines: boolean
  decodeNewlinesForHref: boolean
  keepComments: boolean
}

type IsTagFunction = (tag: string) => boolean

// https://www.w3.org/TR/html5/syntax.html#restrictions-on-content-models
function shouldIgnoreFirstNewline(tag: string, html: string) {
  return '\n' === html[0] && /^pre|textarea$/i.test(tag)
}

const isNotProduction = !isProduction

const defaultOptions: TemplateParserOptions = {
  decodeNewlines: false,
  decodeNewlinesForHref: false,
  keepComments: true,
}

export default class TemplateParser {
  protected readonly options: TemplateParserOptions
  protected expectHTML: boolean = false
  protected isEscapableRawTextElement: IsTagFunction = no
  protected isForeignElement: IsTagFunction = no
  protected isNonPhrasingElement: IsTagFunction = no
  protected isOptionalClosingElement: IsTagFunction = no
  protected isRawTextElement: IsTagFunction = no
  protected isVoidElement: IsTagFunction = no

  private readonly moduleList: Array<Object> = []
  private type?: TemplateSupportedType
  private namespace?: string
  private source: string = ''
  private index: number = 0
  private stackedTagRegExpCache: { [stackTag: string]: RegExp } = {}
  private tagStack: Array<ParsedTag> = []
  private rootTagStack: Array<ParsedTag> = []
  private last: string | undefined
  private lastTagLowerCased: string | undefined

  constructor(options?: TemplateParserOptions) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    }
  }

  protected switchParser(type: TemplateSupportedType): void {
    if (type === this.type) {
      return
    }

    this.type = type
    this.expectHTML = false
    this.isEscapableRawTextElement = this.isForeignElement = this.isNonPhrasingElement = this.isOptionalClosingElement = this.isRawTextElement = this.isVoidElement = no

    // noinspection FallThroughInSwitchStatementJS
    switch (type) {
      case TEXT_XML_MIME_TYPE:
      case APPLICATION_XML_MIME_TYPE:
      case APPLICATION_MATHML_XML_MIME_TYPE:
        break
      case TEXT_HTML_MIME_TYPE:
        this.expectHTML = true // HTML5 syntax support
        this.isOptionalClosingElement = isOptionalClosingHTMLElement
      case APPLICATION_XHTML_XML_MIME_TYPE:
        this.isEscapableRawTextElement = isEscapableRawHTMLTextElement
        this.isForeignElement = isForeignHTMLTag
        this.isNonPhrasingElement = isNonPhrasingHTMLElement
        this.isRawTextElement = isRawHTMLTextElement
        this.isVoidElement = isVoidHTMLElement // todo: XHTML

        break
      case IMAGE_SVG_XML_MIME_TYPE:
        this.isForeignElement = isForeignSVGElement

        break
      default:
        throw new TypeError(`Unsupported source type: ${type}`)
    }
  }

  public parseFromString(
    source: string,
    type: TemplateSupportedType = 'text/html'
  ): void {
    debugger
    // Clear previous data
    this.tagStack = []
    this.rootTagStack = []
    this.index = 0
    this.source = source
    this.switchParser(type)
    this.parseXMLDeclaration()
    this.parseDoctype()

    while (this.source) {
      this.last = this.source

      // Make sure we're not in a raw text element like
      // <script>, <style>, <textarea> or <title>
      if (
        !this.lastTagLowerCased ||
        !(
          this.isRawTextElement(this.lastTagLowerCased) ||
          this.isEscapableRawTextElement(this.lastTagLowerCased)
        )
      ) {
        let textEndTokenIndex: number = this.source.indexOf('<')

        // We have no text, so will be searching for doctype/tag/comment
        if (0 === textEndTokenIndex) {
          // Comment:
          if (commentStartRE.test(this.source)) {
            const commentEndTokenIndex = this.source.indexOf(COMMENT_END_TOKEN)

            // If comment have end token
            if (commentEndTokenIndex >= 0) {
              if (this.options.keepComments) {
                this.comment(
                  this.source.substring(
                    COMMENT_START_TOKEN_LENGTH,
                    commentEndTokenIndex
                  ),
                  this.index,
                  this.index + commentEndTokenIndex + COMMENT_END_TOKEN_LENGTH
                )
              }

              this.advance(commentEndTokenIndex + COMMENT_END_TOKEN_LENGTH)

              continue
            }
          }

          // Conditional comment:
          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
          if (conditionalCommentStartRE.test(this.source)) {
            const conditionalEndTokenIndex = this.source.indexOf(
              CONDITIONAL_COMMENT_END_TOKEN
            )

            // If conditional comment have end token
            if (conditionalEndTokenIndex >= 0) {
              this.advance(
                conditionalEndTokenIndex + CONDITIONAL_COMMENT_END_TOKEN_LENGTH
              )

              continue
            }
          }

          // End tag:
          const endTagMatch = this.source.match(endTagRE)

          if (endTagMatch) {
            const startIndex = this.index

            this.advance(endTagMatch[0].length)
            this.parseEndTag(endTagMatch[1], startIndex, this.index)

            continue
          }

          // Start tag:
          const startTagOpenMatch = this.source.match(startTagOpenRE)

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
                this.advance(1)
              }

              continue
            }
          }
        }

        // We have text
        let text: string

        if (textEndTokenIndex >= 0) {
          let rest = this.source.slice(textEndTokenIndex)
          let ignoreCharIndex

          // Do not treat "<" character in plain text as parser instruction
          while (
            (ignoreCharIndex = rest.indexOf('<', 1)) >= 0 &&
            !endTagRE.test(rest) &&
            !startTagOpenRE.test(rest) &&
            !commentStartRE.test(rest) &&
            !conditionalCommentStartRE.test(rest)
          ) {
            textEndTokenIndex += ignoreCharIndex
            rest = this.source.slice(textEndTokenIndex)
          }

          text = this.source.substring(0, textEndTokenIndex)
        } else {
          text = this.source
          this.source = ''
        }

        if (text) {
          // I guess we will always have text
          this.advance(text.length)
          this.chars(text, this.index - text.length, this.index)
        }
      }
      // We are in a raw text element like <script>, <style>,
      // <textarea> or <title>
      else {
        let endTagLength = 0
        const stackedTagLowerCased = this.lastTagLowerCased
        const stackedTagRE = this.getStackedTagRE(stackedTagLowerCased)
        const rest = this.source.replace(
          stackedTagRE,
          (all: string, content: string, endTag: string): string => {
            endTagLength = endTag.length

            let text = content

            if (
              !(
                this.isRawTextElement(stackedTagLowerCased) ||
                this.isEscapableRawTextElement(stackedTagLowerCased)
              ) &&
              'noscript' !== stackedTagLowerCased
            ) {
              text = text
                .replace(commentRE, '$1')
                .replace(conditionalCommentCharacterDataRE, '$1')
            }

            if (shouldIgnoreFirstNewline(stackedTagLowerCased, text)) {
              text = text.slice(1)
            }

            debugger
            this.chars(text, this.index, this.index + content.length)

            return ''
          }
        )

        this.index += this.source.length - rest.length
        this.source = rest

        this.parseEndTag(
          stackedTagLowerCased,
          this.index - endTagLength,
          this.index
        )
      }

      if (this.source === this.last) {
        debugger
        this.chars(this.source, this.index, this.index + this.source.length)

        if (isNotProduction && !this.tagStack.length) {
          this.warn(`Mal-formatted tag at end of template: "${this.source}"`, {
            start: this.index + this.source.length,
          })
        }
        break
      }
    }

    // Clean up any remaining tags
    this.parseEndTag('', 0, 0) // todo
  }

  private advance(n: number) {
    this.index += n
    this.source = this.source.substring(n)
  }

  private getStackedTagRE(tagName: string): RegExp {
    return (
      this.stackedTagRegExpCache[tagName] ||
      (this.stackedTagRegExpCache[tagName] = new RegExp(
        `([\\s\\S]*?)(</${tagName}[^>]*>)`,
        'i'
      ))
    )
  }

  private parseXMLDeclaration() {
    const xmlDeclarationMatch = this.source.match(xmlDeclarationRE)

    if (xmlDeclarationMatch) {
      // Ignore XML declaration and move forward
      this.advance(xmlDeclarationMatch[0].length)
    }
  }

  private parseDoctype() {
    const doctypeDeclarationMatch = this.source.match(doctypeDeclarationRE)

    if (doctypeDeclarationMatch) {
      // Ignore doctype and move forward
      this.advance(doctypeDeclarationMatch[0].length)
    }
  }

  private parseStartTag(
    startTagOpenMatch: RegExpMatchArray
  ): ParsedTag | undefined {
    const tagName = startTagOpenMatch[1]
    const tagNameLowerCased = tagName.toLowerCase()
    const attrs: Array<ParsedAttribute> = []
    const parsedTag: ParsedTag = {
      name: tagName,
      nameLowerCased: tagNameLowerCased,
      namespace:
        this.namespace ||
        (this.namespace = XML_NAMESPACE_MAP[tagNameLowerCased]),
      attrs,
      unarySlash: '',
      void: false,
      start: this.index,
      end: this.index,
    }

    this.advance(startTagOpenMatch[0].length)

    let startTagCloseTagMatch: RegExpMatchArray | null
    let attrMatch: RegExpMatchArray | null

    // Parse attributes while tag is open
    while (
      !(startTagCloseTagMatch = this.source.match(startTagCloseRE)) &&
      (attrMatch = this.source.match(attributeRE))
    ) {
      const start = this.index
      // Full attribute name, i. e. "xlink:href"
      const attrNameLowerCased = attrMatch[1].toLowerCase()
      // Non-colonized attribute name, i. e. "xlink" (before ":")
      const attrNcNameLowerCased = attrNameLowerCased.replace(qNameRE, '$1')

      this.advance(attrMatch[0].length)

      const attr: ParsedAttribute = {
        name: attrMatch[1],
        nameLowerCased: attrNameLowerCased,
        value: decodeAttrEntities(
          attrMatch[3] || attrMatch[4] || attrMatch[5] || '',
          'A' === tagNameLowerCased && 'href' === attrNameLowerCased
            ? this.options.decodeNewlinesForHref
            : this.options.decodeNewlines
        ),
        start: start + (<RegExpMatchArray>attrMatch[0].match(/^\s*/)).length,
        end: this.index,
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
        const attrNamespace = XML_NAMESPACE_MAP[attrNcNameLowerCased]

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
      this.advance(startTagCloseTagMatch[0].length)
      parsedTag.end = this.index

      // We don't have namespace from previous tag
      if (
        !this.namespace &&
        this.rootTagStack.length &&
        this.rootTagStack[this.rootTagStack.length - 1].namespace
      ) {
        const rootTag = this.rootTagStack[this.rootTagStack.length - 1]

        this.warn(
          `<${parsedTag.name}> element is not allowed in context of <${
            rootTag.name
          }> element without namespace`,
          {
            start: parsedTag.start,
          }
        )
        this.namespace = parsedTag.namespace = rootTag.namespace
      }

      // Change parser for foreign tag
      if (
        !this.rootTagStack.length ||
        this.isForeignElement(tagNameLowerCased)
      ) {
        this.rootTagStack.push(parsedTag)

        if (MIME_TYPE_MAP[tagNameLowerCased]) {
          this.switchParser(MIME_TYPE_MAP[tagNameLowerCased])
          this.namespace = parsedTag.namespace =
            XML_NAMESPACE_MAP[parsedTag.nameLowerCased] || this.namespace
        } else {
          this.namespace = undefined
        }
      }

      return parsedTag
    }
  }

  private handleStartTag(parsedTag: ParsedTag) {
    const tagNameLowerCased = parsedTag.nameLowerCased

    if (this.expectHTML) {
      if (
        this.lastTagLowerCased === 'P' &&
        this.isNonPhrasingElement(tagNameLowerCased)
      ) {
        this.parseEndTag(this.lastTagLowerCased, this.index, this.index)
      }

      if (
        this.isOptionalClosingElement(tagNameLowerCased) &&
        this.lastTagLowerCased === tagNameLowerCased
      ) {
        this.parseEndTag(tagNameLowerCased, this.index, this.index)
      }
    }

    if (!parsedTag.void) {
      this.tagStack.push(parsedTag)
      this.lastTagLowerCased = tagNameLowerCased
    }

    this.start(parsedTag)
  }

  private parseEndTag(tagName: string, start: number, end: number) {
    let tagNameLowerCased
    let pos

    // Find the closest opened tag of the same type
    if (tagName) {
      tagNameLowerCased = tagName.toLowerCase()

      for (pos = this.tagStack.length - 1; pos >= 0; --pos) {
        if (this.tagStack[pos].nameLowerCased === tagNameLowerCased) {
          if (
            this.tagStack[pos].nameLowerCased ===
            this.rootTagStack[this.rootTagStack.length - 1].nameLowerCased
          ) {
            this.rootTagStack.pop()

            if (this.rootTagStack.length) {
              const previousRootTag: ParsedTag = this.rootTagStack[
                this.rootTagStack.length - 1
              ]

              if (MIME_TYPE_MAP[previousRootTag.nameLowerCased]) {
                this.switchParser(MIME_TYPE_MAP[previousRootTag.nameLowerCased])
                this.namespace = previousRootTag.namespace
              } else {
                this.namespace = undefined
              }
            }
          }

          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      let index

      // Close all the open elements, up the stack
      for (index = this.tagStack.length - 1; index >= pos; --index) {
        if (isNotProduction && (index > pos || !tagName)) {
          const stackTag = this.tagStack[index]

          this.warn(`<${stackTag.name}> element has no matching end tag.`, {
            start: stackTag.start,
          })
        }

        this.end(this.tagStack[index].name, start, end)
      }

      // Remove the open elements from the stack
      this.tagStack.length = pos
      this.lastTagLowerCased =
        pos > 0 ? this.tagStack[pos - 1].nameLowerCased : undefined
    } else if (tagNameLowerCased === 'BR') {
      this.start({
        name: tagName,
        nameLowerCased: tagNameLowerCased,
        namespace: this.namespace,
        attrs: [],
        void: true,
        unarySlash: '',
        start,
        end,
      })
    } else if (tagNameLowerCased === 'P') {
      this.start({
        name: tagName,
        nameLowerCased: tagNameLowerCased,
        namespace: this.namespace,
        attrs: [],
        void: false,
        unarySlash: '',
        start,
        end,
      })
      this.end(tagName, start, end)
    }
  }

  private start(parsedTag: ParsedTag) {
    console.log('START: ', parsedTag)
  }

  private end(tagName: string, matchStart: number, matchEnd: number) {
    console.log('END: ', tagName, matchStart, matchEnd)
  }

  private chars(text: string, matchStart: number, matchEnd: number) {
    console.log('TEXT: ', JSON.stringify(text), matchStart, matchEnd)
  }

  private comment(text: string, matchStart: number, matchEnd: number) {
    console.log('COMMENT: ', JSON.stringify(text), matchStart, matchEnd)
  }

  // todo: options type
  private warn(message: string, options: any = {}) {
    console.warn(message)
  }
}
