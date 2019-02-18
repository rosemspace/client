// text and comments nodes should not contain namespaceURI

import no from '@rosem-util/common/no'
import isProduction from '@rosem-util/env/isProduction'
import isForeignHTMLTag from './html/isForeignTag'
import isForeignSVGTag from './svg/isForeignTag'
import isNonPhrasingHTMLTag from './html/isNonPhrasingTag'
import isOptionalClosingHTMLTag from './html/isOptionalClosingTag'
import isUnaryHTMLTag from './html/isUnaryTag'
import { decodeAttrEntities } from './entities'
import {
  ATTRIBUTE_NAMESPACE_MAP,
  ELEMENT_NAMESPACE_MAP,
} from './XMLNamespaceMap'
import { TAG_MIME_TYPE_MAP } from './TagMIMETypeMap'
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
  plainTextElementRE,
  qNameRE,
  startTagCloseRE,
  startTagOpenRE,
  xmlDeclarationRE,
} from './syntax'

export type TemplateSupportedType = 'application/mathml+xml' | SupportedType

export type ParsedTag = {
  name: string
  nameUpperCased: string
  namespace: string
  attrs: Array<ParsedAttribute>
  unarySlash: string
  unary: boolean
  start: number
  end: number
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
  shouldDecodeNewlines: boolean
  shouldDecodeNewlinesForHref: boolean
  shouldKeepComment: boolean
}

type IsTagFunction = (tag: string) => boolean

// #5992
function shouldIgnoreFirstNewline(tag: string, html: string) {
  return /pre|textarea/i.test(tag) && '\n' === html[0]
}

const isNotProduction = !isProduction

const defaultOptions: TemplateParserOptions = {
  shouldDecodeNewlines: false,
  shouldDecodeNewlinesForHref: false,
  shouldKeepComment: true,
}

export default class TemplateParser {
  protected readonly options: TemplateParserOptions
  protected expectHTML: boolean = false
  protected isForeignTag: IsTagFunction = no
  protected isNonPhrasingTag: IsTagFunction = no
  protected isOptionalClosingTag: IsTagFunction = no
  protected isUnaryTag: IsTagFunction = no

  private readonly moduleList: Array<Object> = []
  private namespace: string = ELEMENT_NAMESPACE_MAP.HTML
  private source: string = ''
  private reCache: { [stackTag: string]: RegExp } = {}
  private stack: Array<ParsedTag> = []
  private index: number = 0
  private last: string | undefined
  private lastTagUpperCased: string | undefined

  constructor(options?: TemplateParserOptions) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    }
  }

  protected parseFromStringInNewContext(
    source: string,
    type: TemplateSupportedType
  ) {
    this.parseFromString.call(
      Object.assign(Object.create(TemplateParser.prototype), {
        options: this.options,
        expectHTML: false,
        isForeignTag: no,
        isNonPhrasingTag: no,
        isOptionalClosingTag: no,
        isUnaryTag: no,
        reCache: this.reCache,
        stack: [],
        index: this.index,
        // last: this.last,
        // lastTagUpperCased: this.lastTagUpperCased,
      }),
      source,
      type
    )
  }

  public parseFromString(
    source: string,
    type: TemplateSupportedType = 'text/html'
  ): void {
    debugger
    this.source = source

    switch (type) {
      case 'text/xml':
      case 'application/xml':
        this.namespace = ELEMENT_NAMESPACE_MAP.XML
        this.parseXMLDeclaration()

        break
      case 'application/mathml+xml':
        this.namespace = ELEMENT_NAMESPACE_MAP.MATH
        this.parseXMLDeclaration()

        break
      case 'application/xhtml+xml':
        this.namespace = ELEMENT_NAMESPACE_MAP.XHTML
        this.isForeignTag = isForeignHTMLTag
        this.isNonPhrasingTag = isNonPhrasingHTMLTag
        this.isUnaryTag = isUnaryHTMLTag // todo: XHTML
        this.parseDoctype()

        break
      case 'image/svg+xml':
        this.namespace = ELEMENT_NAMESPACE_MAP.SVG
        this.isForeignTag = isForeignSVGTag
        this.parseDoctype()

        break
      case 'text/html':
        this.namespace = ELEMENT_NAMESPACE_MAP.HTML
        this.expectHTML = true // HTML5 syntax support
        this.isForeignTag = isForeignHTMLTag
        this.isNonPhrasingTag = isNonPhrasingHTMLTag
        this.isOptionalClosingTag = isOptionalClosingHTMLTag
        this.isUnaryTag = isUnaryHTMLTag
        this.parseDoctype()

        break
      default:
        throw new TypeError(`Unsupported source type: ${type}`)
    }

    while (this.source) {
      this.last = this.source

      // Make sure we're not in a plaintext content element like script/style/textarea
      if (
        !this.lastTagUpperCased ||
        !plainTextElementRE.test(this.lastTagUpperCased)
      ) {
        let textEndTokenIndex: number = this.source.indexOf('<')

        // We have no text, so will be searching for doctype/tag/comment
        if (0 === textEndTokenIndex) {
          // Comment:
          if (commentStartRE.test(this.source)) {
            const commentEndTokenIndex = this.source.indexOf(COMMENT_END_TOKEN)

            // If comment have end token
            if (commentEndTokenIndex >= 0) {
              if (this.options.shouldKeepComment) {
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
            // Switch parser if we have embedded element
            if (this.isForeignTag(startTagOpenMatch[1])) {
              const tagNameUpperCased = startTagOpenMatch[1].toUpperCase()

              let embeddedSource
              this.source = this.source.replace(
                this.getStackedTagRE(tagNameUpperCased),
                (all: string): string => {
                  embeddedSource = all

                  return ''
                }
              )

              if (embeddedSource) {
                this.parseFromStringInNewContext(
                  embeddedSource,
                  TAG_MIME_TYPE_MAP[tagNameUpperCased]
                )
                this.index += embeddedSource.length

                continue
              }
            }

            // Or continue parse
            const parsedStartTag = this.parseStartTag(startTagOpenMatch)

            if (parsedStartTag) {
              this.handleStartTag(parsedStartTag)

              if (
                shouldIgnoreFirstNewline(
                  parsedStartTag.nameUpperCased,
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
            // !rest.match(doctypeRE) &&
            !endTagRE.test(rest) &&
            !startTagOpenRE.test(rest) &&
            !commentStartRE.test(rest) &&
            !conditionalCommentStartRE.test(rest)
          ) {
            textEndTokenIndex += ignoreCharIndex
            rest = this.source.slice(textEndTokenIndex)
          }

          text = this.source.substring(0, textEndTokenIndex)
          // this.advance(textEndTokenIndex) todo roshe: why it here?
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
      // We are in a plaintext content element like script/style/textarea
      else {
        let endTagLength = 0
        const stackedTagUpperCased = this.lastTagUpperCased
        const stackedTagRE = this.getStackedTagRE(stackedTagUpperCased)
        const rest = this.source.replace(
          stackedTagRE,
          (all: string, text: string, endTag: string): string => {
            endTagLength = endTag.length

            if (
              !plainTextElementRE.test(stackedTagUpperCased) &&
              stackedTagUpperCased !== 'NOSCRIPT'
            ) {
              text = text
                .replace(commentRE, '$1')
                .replace(conditionalCommentCharacterDataRE, '$1')
            }

            if (shouldIgnoreFirstNewline(stackedTagUpperCased, text)) {
              text = text.slice(1)
            }

            debugger
            this.chars(text)

            return ''
          }
        )

        this.index += this.source.length - rest.length
        this.source = rest

        this.parseEndTag(
          stackedTagUpperCased,
          this.index - endTagLength,
          this.index
        )
      }

      if (this.source === this.last) {
        debugger
        this.chars(this.source)

        if (isNotProduction && !this.stack.length) {
          this.warn(`Mal-formatted tag at end of template: "${this.source}"`, {
            start: this.index + this.source.length,
          })
        }
        break
      }
    }

    // Clean up any remaining tags
    this.parseEndTag()
    // Clear temporary data
    this.stack = []
    this.index = 0
  }

  private advance(n: number) {
    this.index += n
    this.source = this.source.substring(n)
  }

  private getStackedTagRE(tagName: string): RegExp {
    return (
      this.reCache[tagName] ||
      (this.reCache[tagName] = new RegExp(
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
    const tagNameUpperCased = startTagOpenMatch[1].toUpperCase()
    const attrs: Array<ParsedAttribute> = []
    const parsedTag: ParsedTag = {
      name: startTagOpenMatch[1],
      nameUpperCased: tagNameUpperCased,
      namespace: this.namespace,
      attrs,
      unarySlash: '',
      unary: false,
      start: this.index,
      end: this.index,
    }

    this.advance(startTagOpenMatch[0].length)

    let unaryTagMatch: RegExpMatchArray | null
    let attrMatch: RegExpMatchArray | null

    // Parse attributes while tag is open
    while (
      !(unaryTagMatch = this.source.match(startTagCloseRE)) &&
      (attrMatch = this.source.match(attributeRE))
    ) {
      const start = this.index
      const attrNameLowerCased = attrMatch[1].toLowerCase()
      const attrNcNameLowerCased = attrNameLowerCased.replace(qNameRE, '$1')

      this.advance(attrMatch[0].length)

      // todo: add handle of xmlns attribute
      attrs.push({
        name: attrMatch[1],
        nameLowerCased: attrNameLowerCased,
        value: decodeAttrEntities(
          attrMatch[3] || attrMatch[4] || attrMatch[5] || '',
          'A' === tagNameUpperCased && 'href' === attrNameLowerCased
            ? this.options.shouldDecodeNewlinesForHref
            : this.options.shouldDecodeNewlines
        ),
        start: start + (<RegExpMatchArray>attrMatch[0].match(/^\s*/)).length,
        end: this.index,
      })

      // Add namespace for attribute
      if (attrNcNameLowerCased) {
        const namespace = ATTRIBUTE_NAMESPACE_MAP[attrNcNameLowerCased]

        if (namespace) {
          attrs[attrs.length - 1].namespace = namespace
        }
      }
    }

    if (unaryTagMatch) {
      parsedTag.unarySlash = unaryTagMatch[1]
      parsedTag.unary =
        this.isUnaryTag(tagNameUpperCased) || Boolean(unaryTagMatch[1])
      this.advance(unaryTagMatch[0].length)
      parsedTag.end = this.index

      return parsedTag
    }
  }

  private handleStartTag(parsedTag: ParsedTag) {
    const tagNameUpperCased = parsedTag.nameUpperCased

    if (this.expectHTML) {
      if (
        this.lastTagUpperCased === 'P' &&
        this.isNonPhrasingTag(tagNameUpperCased)
      ) {
        this.parseEndTag(this.lastTagUpperCased, this.index, this.index)
      }

      if (
        this.isOptionalClosingTag(tagNameUpperCased) &&
        this.lastTagUpperCased === tagNameUpperCased
      ) {
        this.parseEndTag(tagNameUpperCased, this.index, this.index)
      }
    }

    if (!parsedTag.unary) {
      this.stack.push(parsedTag)
      this.lastTagUpperCased = tagNameUpperCased
    }

    this.start(parsedTag)
  }

  private parseEndTag(tagName: string, start: number, end: number) {
    let tagNameUpperCased
    let pos

    // Find the closest opened tag of the same type
    if (tagName) {
      tagNameUpperCased = tagName.toUpperCase()

      for (pos = this.stack.length - 1; pos >= 0; --pos) {
        if (this.stack[pos].nameUpperCased === tagNameUpperCased) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let index = this.stack.length - 1; index >= pos; --index) {
        if (isNotProduction && (index > pos || !tagName)) {
          const stackTag = this.stack[index]

          this.warn(`tag <${stackTag.name}> has no matching end tag.`, {
            start: stackTag.start,
          })
        }

        this.end(this.stack[index].name, start, end)
      }

      // Remove the open elements from the stack
      this.stack.length = pos
      this.lastTagUpperCased =
        pos > 0 ? this.stack[pos - 1].nameUpperCased : undefined
    } else if (tagNameUpperCased === 'BR') {
      this.start({
        name: tagName,
        nameUpperCased: tagNameUpperCased,
        namespace: this.namespace,
        attrs: [],
        unarySlash: '',
        unary: true,
        start,
        end,
      })
    } else if (tagNameUpperCased === 'P') {
      this.start({
        name: tagName,
        nameUpperCased: tagNameUpperCased,
        namespace: this.namespace,
        attrs: [],
        unarySlash: '',
        unary: false,
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
