import no from '@rosem-util/common/no'
import isProduction from '@rosem-util/env/isProduction'
import potentialCustomElementNameCharRegExp from '@rosem-util/dom/potentialCustomElementNameCharRegExp'
import getStackedTagRegExp from './getStackedTagRegExp'
import isEscapableRawHTMLTextElement from './html/isEscapableRawTextElement'
import isForeignHTMLTag from './html/isForeignElement'
import isForeignSVGElement from './svg/isForeignElement'
import isNonPhrasingHTMLElement from './html/isNonPhrasingElement'
import isOptionalClosingHTMLElement from './html/isOptionalClosingElement'
import isRawTextElement from './isRawTextElement'
import isVoidHTMLElement from './html/isVoidElement'
import decodeAttrEntities from './decodeAttrEntities'
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
  TEXT_XML_MIME_TYPE,
} from './typeMap'

export const processingInstructionRE = /^\s*<\?[^>]+\?>/
export const xmlDeclarationRE = /^\s*<\?xml[^>]+>/
export const doctypeDeclarationRE = /^\s*<!DOCTYPE [^>]+>/i
// Non-colonized name e.g. "name"
// could use CombiningChar and Extender characters
// (https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName)
// but for ui templates we can enforce a simple charset
const ncNameREPart = `[a-zA-Z_][\\-\\.0-9_${
  potentialCustomElementNameCharRegExp.source
}]*`
// Qualified name e.g. "namespace:name"
export const qNameRE = new RegExp(`^(?:(${ncNameREPart}):)?(${ncNameREPart})$`)
const qNameRECapturePart = `((?:${ncNameREPart}\\:)?${ncNameREPart})`
export const startTagOpenRE = new RegExp(`^<${qNameRECapturePart}`)
export const startTagCloseRE = /^\s*(\/?)>/
// Regular Expressions for parsing tags and attributes
export const attributeRE = /^\s*([^\s"'<>/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
export const endTagRE = new RegExp(`^<\\/${qNameRECapturePart}[^>]*>`)
// Used repeating construction to avoid being passed as HTML comment when inlined in a page
export const commentStartRE = /^<!-{2}/
export const conditionalCommentStartRE = /^<!\[/
export const commentRE = /<!-{2}([\s\S]*?)-->/g
export const cDataSectionStartRE = /^<!\[CDATA\[/
export const cDataSectionRE = /<!\[CDATA\[([\s\S]*?)]]>/g
export const COMMENT_END_TOKEN = '-->'
const commentStartTokenLength = 4 // <!--
const commentEndTokenLength = 3 // -->
export const CDATA_SECTION_END_TOKEN = ']]>'
const cDATASectionStartTokenLength = 9 // <![CDATA[
const cDATASectionEndTokenLength = 3 // ]]>
export const CONDITIONAL_COMMENT_END_TOKEN = ']>'
const conditionalCommentStartTokenLength = 3 // <![
const conditionalCommentEndTokenLength = 2 // ]>

type ParsedItem = {
  matchStart: number
  matchEnd: number
}

export type ParsedStartTag = {
  name: string
  nameLowerCased: string
  namespace?: string
  attrs: Array<ParsedAttribute>
  void: boolean
  unarySlash: string
} & ParsedItem

export type ParsedAttribute = {
  name: string
  nameLowerCased: string
  namespace?: string
  value: string
} & ParsedItem

export type ParsedEndTag = {
  name: string
  nameLowerCased: string
} & ParsedItem

export type ParsedText = {
  text: string
} & ParsedItem

export type TemplateParserOptions = {
  decodeNewlines: boolean
  decodeNewlinesForHref: boolean
  keepComments: boolean
  keepCDATASections: boolean
}

export type WarningData = {
  start: number
}

type IsElement = (tag: string) => boolean

const isNotProduction = !isProduction
const defaultOptions: TemplateParserOptions = {
  decodeNewlines: false,
  decodeNewlinesForHref: false,
  keepComments: true,
  keepCDATASections: true,
}

// https://www.w3.org/TR/html5/syntax.html#restrictions-on-content-models
function shouldIgnoreFirstNewline(tag: string, html: string) {
  return '\n' === html[0] && /^pre|textarea$/i.test(tag)
}

export default class DOMLaxParser {
  protected readonly options: TemplateParserOptions
  protected readonly moduleList: Array<ModuleInterface> = []
  protected type?: SourceSupportedType
  protected namespace?: string
  protected source: string = ''
  protected index: number = 0
  protected tagStack: Array<ParsedStartTag> = []
  protected rootTagStack: Array<ParsedStartTag> = []
  protected last: string | undefined
  protected lastTagLowerCased: string | undefined
  protected expectHTML: boolean = false
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
            if (commentEndTokenIndex >= commentStartTokenLength) {
              if (this.options.keepComments) {
                this.comment({
                  text: this.source.slice(
                    commentStartTokenLength,
                    commentEndTokenIndex
                  ),
                  matchStart: this.index,
                  matchEnd:
                    this.index + commentEndTokenIndex + commentEndTokenLength,
                })
              }

              this.advance(commentEndTokenIndex + commentEndTokenLength)

              continue
            }
          }

          // Character data:
          if (cDataSectionStartRE.test(this.source)) {
            const cdataSectionEndTokenIndex = this.source.indexOf(
              CDATA_SECTION_END_TOKEN
            )

            // If CDATA section have end token
            if (cdataSectionEndTokenIndex >= cDATASectionStartTokenLength) {
              if (this.options.keepCDATASections) {
                this.cDataSection({
                  text: this.source.slice(
                    cDATASectionStartTokenLength,
                    cdataSectionEndTokenIndex
                  ),
                  matchStart: this.index,
                  matchEnd:
                    this.index +
                    cdataSectionEndTokenIndex +
                    cDATASectionEndTokenLength,
                })
              }
            }
          }

          // Conditional comment:
          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
          if (conditionalCommentStartRE.test(this.source)) {
            const conditionalCommentEndTokenIndex = this.source.indexOf(
              CONDITIONAL_COMMENT_END_TOKEN
            )

            // If conditional comment have end token
            if (
              conditionalCommentEndTokenIndex >=
              conditionalCommentStartTokenLength
            ) {
              this.advance(
                conditionalCommentEndTokenIndex +
                  conditionalCommentEndTokenLength
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

          // Do not treat character "<" in plain text as parser instruction
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

          text = this.source.slice(0, textEndTokenIndex)
        } else {
          text = this.source
          this.source = ''
        }

        // todo I guess we will always have text
        if (text) {
          this.advance(text.length)
          this.text({
            text,
            matchStart: this.index - text.length,
            matchEnd: this.index,
          })
        }
      }
      // We are in a raw text element like <script>, <style>,
      // <textarea> or <title>
      else {
        let endTagLength = 0
        const stackedTagLowerCased = this.lastTagLowerCased
        const stackedTagRE = getStackedTagRegExp(stackedTagLowerCased)
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
              text = text.replace(commentRE, '$1').replace(cDataSectionRE, '$1')
            }

            if (shouldIgnoreFirstNewline(stackedTagLowerCased, text)) {
              text = text.slice(1)
            }

            this.text({
              text,
              matchStart: this.index,
              matchEnd: this.index + content.length,
            })

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
        this.text({
          text: this.source,
          matchStart: this.index,
          matchEnd: this.index + this.source.length,
        })

        // When a template ends with "<..." (just the example)
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

  protected advance(n: number) {
    this.index += n
    this.source = this.source.slice(n)
  }

  protected parseXMLDeclaration() {
    const xmlDeclarationMatch = this.source.match(xmlDeclarationRE)

    if (xmlDeclarationMatch) {
      // Ignore XML declaration and move forward
      this.advance(xmlDeclarationMatch[0].length)
    }
  }

  protected parseDoctype() {
    const doctypeDeclarationMatch = this.source.match(doctypeDeclarationRE)

    if (doctypeDeclarationMatch) {
      // Ignore doctype and move forward
      this.advance(doctypeDeclarationMatch[0].length)
    }
  }

  protected parseStartTag(
    startTagOpenMatch: RegExpMatchArray
  ): ParsedStartTag | undefined {
    const tagName = startTagOpenMatch[1]
    const tagNameLowerCased = tagName.toLowerCase()
    const attrs: Array<ParsedAttribute> = []
    const parsedTag: ParsedStartTag = {
      name: tagName,
      nameLowerCased: tagNameLowerCased,
      namespace:
        this.namespace || (this.namespace = namespaceMap[tagNameLowerCased]),
      attrs,
      unarySlash: '',
      void: false,
      matchStart: this.index,
      matchEnd: this.index,
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
        matchStart:
          start + (<RegExpMatchArray>attrMatch[0].match(/^\s*/)).length,
        matchEnd: this.index,
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
      this.advance(startTagCloseTagMatch[0].length)
      parsedTag.matchEnd = this.index

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
              start: parsedTag.matchStart,
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

    if (this.expectHTML) {
      if (
        this.lastTagLowerCased === 'p' &&
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

    this.tagStart(parsedTag)
  }

  protected parseEndTag(tagName: string, matchStart: number, matchEnd: number) {
    let tagNameLowerCased
    let pos

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
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      let index

      // Close all the open elements, up the stack
      for (index = this.tagStack.length - 1; index >= pos; --index) {
        const stackTag = this.tagStack[index]

        if (isNotProduction && (index > pos || !tagName)) {
          this.warn(`<${stackTag.name}> element has no matching end tag.`, {
            start: stackTag.matchStart,
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
      this.lastTagLowerCased =
        pos > 0 ? this.tagStack[pos - 1].nameLowerCased : undefined
    } else if (tagNameLowerCased === 'br') {
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

  protected tagStart(parsedTag: ParsedStartTag) {
    let module

    for (module of this.moduleList) {
      module.tagStart(parsedTag)
    }
  }

  protected tagEnd(parsedEndTag: ParsedEndTag) {
    let module

    for (module of this.moduleList) {
      module.tagEnd(parsedEndTag)
    }
  }

  protected text(parsedText: ParsedText) {
    let module

    for (module of this.moduleList) {
      module.text(parsedText)
    }
  }

  protected comment(parsedComment: ParsedText) {
    let module

    for (module of this.moduleList) {
      module.comment(parsedComment)
    }
  }

  protected cDataSection(parsedCDATASection: ParsedText) {
    let module

    for (module of this.moduleList) {
      module.cDataSection(parsedCDATASection)
    }
  }

  protected warn(message: string, data: WarningData) {
    let module

    for (module of this.moduleList) {
      module.warn(message, data)
    }
  }
}
