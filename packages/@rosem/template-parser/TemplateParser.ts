import no from '@rosem-util/common/no'
import isProduction from '@rosem-util/env/isProduction'
import isNonPhrasingHTMLTag from './html/isNonPhrasingTag'
import isOptionalClosingHTMLTag from './html/isOptionalClosingTag'
import isUnaryHTMLTag from './html/isUnaryTag'
import decodeAttribute from './decodeAttribute'
import {
  attributeRE,
  COMMENT_END_TOKEN,
  COMMENT_END_TOKEN_LENGTH,
  COMMENT_START_TOKEN_LENGTH,
  commentRE,
  commentStartRE,
  CONDITIONAL_COMMENT_END_TOKEN,
  CONDITIONAL_COMMENT_END_TOKEN_LENGTH,
  conditionalCommentRE,
  conditionalCommentStartRE,
  doctypeRE,
  endTagRE,
  plainTextElementRE,
  startTagCloseRE,
  startTagOpenRE,
} from './syntax'

const isNotProduction = !isProduction
const reCache: { [stackTag: string]: RegExp } = {}

// #5992
function shouldIgnoreFirstNewline(tag: string, html: string) {
  return /pre|textarea/i.test(tag) && '\n' === html[0]
}

let isNonPhrasingTag: Function
let isOptionalClosingTag: Function
let isUnaryTag: Function
let html: string
let stack: Array<StackTag>
let index: number
let last
let lastTagUpperCased: string | undefined

type StackTag = {
  tag: string
  tagNameUpperCased: string
  attrs: Array<ParsedAttribute>
  start: number
  end: number
}

type ParsedTag = {
  tag: string
  tagNameUpperCased: string
  attrs: Array<AttributeMatch>
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

type AttributeMatch = RegExpMatchArray & {
  start: number
  end: number
}

type TemplateParserOptions = {
  expectHTML: boolean
  shouldDecodeNewlines: boolean
  shouldDecodeNewlinesForHref: boolean
  shouldKeepComment: boolean
}

const defaultOptions: TemplateParserOptions = {
  expectHTML: true,
  shouldDecodeNewlines: false,
  shouldDecodeNewlinesForHref: false,
  shouldKeepComment: true,
}

export default class TemplateParser {
  private readonly options: TemplateParserOptions
  private readonly moduleList: Array<Object> = []

  constructor(options?: TemplateParserOptions) {
    this.options = {
      ...defaultOptions,
      ...(options || {}),
    }
  }

  public parseFromString(
    source: string,
    type: SupportedType = 'text/html'
  ): void {
    debugger
    html = source
    stack = []
    index = 0

    switch (type) {
      case 'text/xml':
      case 'application/xml':
      case 'application/xhtml+xml':
      case 'image/svg+xml':
        isNonPhrasingTag = no
        isOptionalClosingTag = no
        isUnaryTag = no

        break
      case 'text/html':
        isNonPhrasingTag = isNonPhrasingHTMLTag
        isOptionalClosingTag = isOptionalClosingHTMLTag
        isUnaryTag = isUnaryHTMLTag

        break
      default:
        throw new TypeError(`Unsupported source type: ${type}`)
    }

    while (html) {
      last = html

      // Make sure we're not in a plaintext content element like script/style/textarea
      if (!lastTagUpperCased || !plainTextElementRE.test(lastTagUpperCased)) {
        let textEndTokenIndex: number = html.indexOf('<')

        // We have no text, so will be searching for doctype/tag/comment
        if (0 === textEndTokenIndex) {
          // Comment:
          if (commentStartRE.test(html)) {
            const commentEndTokenIndex = html.indexOf(COMMENT_END_TOKEN)

            // If comment have end token
            if (commentEndTokenIndex >= 0) {
              if (this.options.shouldKeepComment) {
                this.comment(
                  html.substring(
                    COMMENT_START_TOKEN_LENGTH,
                    commentEndTokenIndex
                  ),
                  index,
                  index + commentEndTokenIndex + COMMENT_END_TOKEN_LENGTH
                )
              }

              this.advance(commentEndTokenIndex + COMMENT_END_TOKEN_LENGTH)

              continue
            }
          }

          // Conditional comment:
          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
          if (conditionalCommentStartRE.test(html)) {
            const conditionalEndTokenIndex = html.indexOf(
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

          // Doctype:
          const doctypeMatch = html.match(doctypeRE)

          if (doctypeMatch) {
            // Ignore doctype and move forward
            this.advance(doctypeMatch[0].length)

            continue
          }

          // End tag:
          const endTagMatch = html.match(endTagRE)

          if (endTagMatch) {
            const startIndex = index

            this.advance(endTagMatch[0].length)
            this.parseEndTag(endTagMatch[1], startIndex, index)

            continue
          }

          // Start tag:
          const startTagOpenMatch = html.match(startTagOpenRE)

          if (startTagOpenMatch) {
            const parsedStartTag = this.parseStartTag(startTagOpenMatch)

            if (parsedStartTag) {
              this.handleStartTag(parsedStartTag)

              if (
                shouldIgnoreFirstNewline(parsedStartTag.tagNameUpperCased, html)
              ) {
                this.advance(1)
              }

              continue
            }
          }
        }

        // We have text
        let text: string, rest, next

        if (textEndTokenIndex >= 0) {
          rest = html.slice(textEndTokenIndex)

          while (
            !endTagRE.test(rest) &&
            !startTagOpenRE.test(rest) &&
            !commentStartRE.test(rest) &&
            !conditionalCommentStartRE.test(rest)
          ) {
            // < in plain text, be forgiving and treat it as text
            next = rest.indexOf('<', 1)

            if (next < 0) {
              break
            }

            textEndTokenIndex += next
            rest = html.slice(textEndTokenIndex)
          }
          text = html.substring(0, textEndTokenIndex)
          // this.advance(textEndTokenIndex) todo roshe: why it here?
        } else {
          text = html
          html = ''
        }

        if (text) {
          this.advance(text.length)
          this.chars(text, index - text.length, index)
        }
      } else {
        let endTagLength = 0
        const stackedTagUpperCased = lastTagUpperCased
        const reStackedTag =
          reCache[stackedTagUpperCased] ||
          (reCache[stackedTagUpperCased] = new RegExp(
            '([\\s\\S]*?)(</' + stackedTagUpperCased + '[^>]*>)',
            'i'
          ))
        const rest = html.replace(reStackedTag, (all, text, endTag) => {
          endTagLength = endTag.length

          if (
            !plainTextElementRE.test(stackedTagUpperCased) &&
            stackedTagUpperCased !== 'NOSCRIPT'
          ) {
            text = text
              .replace(commentRE, '$1')
              .replace(conditionalCommentRE, '$1')
          }

          if (shouldIgnoreFirstNewline(stackedTagUpperCased, text)) {
            text = text.slice(1)
          }

          //debugger
          this.chars(text)

          return ''
        })
        index += html.length - rest.length
        html = rest
        this.parseEndTag(stackedTagUpperCased, index - endTagLength, index)
      }

      if (html === last) {
        //debugger
        this.chars(html)

        if (isNotProduction && !stack.length) {
          this.warn(`Mal-formatted tag at end of template: "${html}"`, {
            start: index + html.length,
          })
        }
        break
      }
    }

    // Clean up any remaining tags
    this.parseEndTag()
  }

  private start(
    tagName: string,
    attrs: Array<ParsedAttribute>,
    unary: boolean,
    matchStart: number,
    matchEnd: number
  ) {
    console.log(tagName, attrs, unary, matchStart, matchEnd)
  }

  private end(tagName: string, matchStart: number, matchEnd: number) {
    console.log(tagName, matchStart, matchEnd)
  }

  private chars(text: string, matchStart: number, matchEnd: number) {
    console.log(text, matchStart, matchEnd)
  }

  private comment(text: string, matchStart: number, matchEnd: number) {
    console.log(text, matchStart, matchEnd)
  }

  // todo: options type
  private warn(message: string, options: any = {}) {
    console.warn(message)
  }

  private advance(n: number) {
    index += n
    html = html.substring(n)
  }

  private parseStartTag(
    startTagOpenMatch: RegExpMatchArray
  ): ParsedTag | undefined {
    const parsedTag: ParsedTag = {
      tag: startTagOpenMatch[1],
      tagNameUpperCased: startTagOpenMatch[1].toUpperCase(),
      attrs: [],
      unarySlash: '',
      start: index,
      end: index,
    }

    this.advance(startTagOpenMatch[0].length)

    let end, attr: RegExpMatchArray | AttributeMatch | null

    // Parse attributes while tag is open
    while (
      !(end = html.match(startTagCloseRE)) &&
      (attr = html.match(attributeRE))
    ) {
      ;(<AttributeMatch>attr).start = index
      this.advance((<AttributeMatch>attr)[0].length)
      ;(<AttributeMatch>attr).end = index
      parsedTag.attrs.push(<AttributeMatch>attr)
    }

    if (end) {
      parsedTag.unarySlash = end[1]
      this.advance(end[0].length)
      parsedTag.end = index

      return parsedTag
    }
  }

  private handleStartTag(parsedTag: ParsedTag) {
    const tag = parsedTag.tag
    const tagNameUpperCased = parsedTag.tagNameUpperCased
    const unarySlash = parsedTag.unarySlash

    if (this.options.expectHTML) {
      if (lastTagUpperCased === 'P' && isNonPhrasingTag(tagNameUpperCased)) {
        this.parseEndTag(lastTagUpperCased, index, index)
      }

      if (
        isOptionalClosingTag(tagNameUpperCased) &&
        lastTagUpperCased === tagNameUpperCased
      ) {
        this.parseEndTag(tagNameUpperCased, index, index)
      }
    }

    const unary = isUnaryTag(tagNameUpperCased) || Boolean(unarySlash)
    const l = parsedTag.attrs.length
    const attrs: Array<ParsedAttribute> = new Array(l)

    for (let i = 0; i < l; i++) {
      const args: AttributeMatch = parsedTag.attrs[i]
      const value = args[3] || args[4] || args[5] || ''
      const shouldDecodeNewlines =
        tagNameUpperCased === 'A' && args[1] === 'href'
          ? this.options.shouldDecodeNewlinesForHref
          : this.options.shouldDecodeNewlines

      attrs[i] = {
        name: args[1],
        value: decodeAttribute(value, shouldDecodeNewlines),
        start: args.start + (args[0].match(/^\s*/) as RegExpMatchArray).length,
        end: args.end,
      }
    }

    if (!unary) {
      stack.push({
        tag: tag,
        tagNameUpperCased: tagNameUpperCased,
        attrs: attrs,
        start: parsedTag.start,
        end: parsedTag.end,
      })
      lastTagUpperCased = tagNameUpperCased
    }

    this.start(tagNameUpperCased, attrs, unary, parsedTag.start, parsedTag.end)
  }

  private parseEndTag(tagName: string, start: number, end: number) {
    let pos

    // Find the closest opened tag of the same type
    if (tagName) {
      tagName = tagName.toUpperCase()

      for (pos = stack.length - 1; pos >= 0; --pos) {
        if (stack[pos].tagNameUpperCased === tagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; --i) {
        if (isNotProduction && (i > pos || !tagName)) {
          this.warn(`tag <${stack[i].tag}> has no matching end tag.`, {
            start: stack[i].start,
          })
        }

        this.end(stack[i].tag, start, end)
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTagUpperCased = pos > 0 ? stack[pos - 1].tagNameUpperCased : undefined
    } else if (tagName === 'BR') {
      this.start(tagName, [], true, start, end)
    } else if (tagName === 'P') {
      this.start(tagName, [], false, start, end)
      this.end(tagName, start, end)
    }
  }
}
