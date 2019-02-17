// text and comments nodes should not contain namespaceURI

import no from '@rosem-util/common/no'
import isProduction from '@rosem-util/env/isProduction'
import isNonPhrasingHTMLTag from './html/isNonPhrasingTag'
import isOptionalClosingHTMLTag from './html/isOptionalClosingTag'
import isUnaryHTMLTag from './html/isUnaryTag'
import { decodeAttrEntities } from './entity'
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
  doctypeRE,
  endTagRE,
  plainTextElementRE,
  startTagCloseRE,
  startTagOpenRE,
} from './syntax'

type ParsedTag = {
  tag: string
  tagNameUpperCased: string
  // attrs: Array<AttributeMatch>
  attrs: Array<ParsedAttribute>
  unarySlash: string
  start: number
  end: number
}

type ParsedAttribute = {
  name: string
  value: string
  start: number
  end: number
}

// #5992
function shouldIgnoreFirstNewline(tag: string, html: string) {
  return /pre|textarea/i.test(tag) && '\n' === html[0]
}

const isNotProduction = !isProduction

type TemplateParserOptions = {
  shouldDecodeNewlines: boolean
  shouldDecodeNewlinesForHref: boolean
  shouldKeepComment: boolean
}

type IsTagFunction = (tag: string) => boolean

const defaultOptions: TemplateParserOptions = {
  shouldDecodeNewlines: false,
  shouldDecodeNewlinesForHref: false,
  shouldKeepComment: true,
}

export default class TemplateParser {
  protected readonly options: TemplateParserOptions
  protected expectHTML: boolean = false
  protected isNonPhrasingTag: IsTagFunction = no
  protected isOptionalClosingTag: IsTagFunction = no
  protected isUnaryTag: IsTagFunction = no

  private readonly moduleList: Array<Object> = []
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

  protected parseFromStringInNewContext(type: SupportedType) {
    this.parseFromString.call(
      {
        options: this.options,
        isNonPhrasingTag: no,
        isOptionalClosingTag: no,
        isUnaryTag: no,
        reCache: this.reCache,
        stack: this.stack,
        index: this.index,
        last: this.last,
        lastTagUpperCased: this.lastTagUpperCased,
      },
      this.source,
      type
    )
  }

  public parseFromString(
    source: string,
    type: SupportedType = 'text/html'
  ): void {
    debugger
    this.source = source
    // this.stack = []
    // this.index = 0 // todo: zero index when parsing finished

    switch (type) {
      case 'text/xml':
      case 'application/xml':
      case 'application/xhtml+xml':
      case 'image/svg+xml':
        break
      case 'text/html':
        this.expectHTML = true // HTML5 syntax support
        this.isNonPhrasingTag = isNonPhrasingHTMLTag
        this.isOptionalClosingTag = isOptionalClosingHTMLTag
        this.isUnaryTag = isUnaryHTMLTag

        // Doctype:
        const doctypeMatch = this.source.match(doctypeRE)

        if (doctypeMatch) {
          // Ignore doctype and move forward
          this.advance(doctypeMatch[0].length)
        }

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
            const parsedStartTag = this.parseStartTag(startTagOpenMatch)

            if (parsedStartTag) {
              this.handleStartTag(parsedStartTag)

              if (
                shouldIgnoreFirstNewline(
                  parsedStartTag.tagNameUpperCased,
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
        const reStackedTag =
          this.reCache[stackedTagUpperCased] ||
          (this.reCache[stackedTagUpperCased] = new RegExp(
            '([\\s\\S]*?)(</' + stackedTagUpperCased + '[^>]*>)',
            'i'
          ))
        const rest = this.source.replace(
          reStackedTag,
          (all: string, text: string, endTag: string) => {
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
  }

  private advance(n: number) {
    this.index += n
    this.source = this.source.substring(n)
  }

  private parseStartTag(
    startTagOpenMatch: RegExpMatchArray
  ): ParsedTag | undefined {
    const tagNameUpperCased = startTagOpenMatch[1].toUpperCase()
    const parsedTag: ParsedTag = {
      tag: startTagOpenMatch[1],
      tagNameUpperCased,
      attrs: [],
      unarySlash: '',
      start: this.index,
      end: this.index,
    }

    this.advance(startTagOpenMatch[0].length)

    let unaryTagMatch: RegExpMatchArray | null
    let attr: RegExpMatchArray | null

    // Parse attributes while tag is open
    while (
      !(unaryTagMatch = this.source.match(startTagCloseRE)) &&
      (attr = this.source.match(attributeRE))
    ) {
      const start = this.index
      this.advance(attr[0].length)

      parsedTag.attrs.push({
        name: attr[1],
        value: decodeAttrEntities(
          attr[3] || attr[4] || attr[5] || '',
          tagNameUpperCased === 'A' && attr[1] === 'href'
            ? this.options.shouldDecodeNewlinesForHref
            : this.options.shouldDecodeNewlines
        ),
        start: start + (attr[0].match(/^\s*/) as RegExpMatchArray).length,
        end: this.index,
      })
    }

    if (unaryTagMatch) {
      parsedTag.unarySlash = unaryTagMatch[1]
      this.advance(unaryTagMatch[0].length)
      parsedTag.end = this.index

      return parsedTag
    }
  }

  private handleStartTag(parsedTag: ParsedTag) {
    const tag = parsedTag.tag
    const tagNameUpperCased = parsedTag.tagNameUpperCased
    const unarySlash = parsedTag.unarySlash
    const unary = this.isUnaryTag(tagNameUpperCased) || Boolean(unarySlash)

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

    if (!unary) {
      this.stack.push(parsedTag)
      this.lastTagUpperCased = tagNameUpperCased
    }

    this.start(tag, parsedTag.attrs, unary, parsedTag.start, parsedTag.end)
  }

  private parseEndTag(tagName: string, start: number, end: number) {
    let pos

    // Find the closest opened tag of the same type
    if (tagName) {
      tagName = tagName.toUpperCase()

      for (pos = this.stack.length - 1; pos >= 0; --pos) {
        if (this.stack[pos].tagNameUpperCased === tagName) {
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

          this.warn(`tag <${stackTag.tag}> has no matching end tag.`, {
            start: stackTag.start,
          })
        }

        this.end(this.stack[index].tag, start, end)
      }

      // Remove the open elements from the stack
      this.stack.length = pos
      this.lastTagUpperCased =
        pos > 0 ? this.stack[pos - 1].tagNameUpperCased : undefined
    } else if (tagName === 'BR') {
      this.start(tagName, [], true, start, end)
    } else if (tagName === 'P') {
      this.start(tagName, [], false, start, end)
      this.end(tagName, start, end)
    }
  }

  private start(
    tagName: string,
    attrs: Array<ParsedAttribute>,
    unary: boolean,
    matchStart: number,
    matchEnd: number
  ) {
    console.log('START: ', tagName, attrs, unary, matchStart, matchEnd)
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
