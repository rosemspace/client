import {
  conditionalCommentStartRegExp,
  conditionalCommentRegExp,
  foreignElementRegExp,
  nonPhrasingElementRegExp,
  optionalClosingElementRegExp,
  reservedAttrRegExp,
  voidElementRegExp,
  shouldIgnoreFirstNewline,
  rawTextElementRegExp,
  escapableRawTextElementRegExp,
} from '@rosem/html-syntax'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  TEXT_HTML_MIME_TYPE,
  HTML_NAMESPACE,
  MATHML_NAMESPACE,
} from '@rosem/w3-util'
import {
  default as XMLParser,
  NamespaceMap,
  XMLProcessorMap
} from '@rosem/xml-parser'
import {
  ParsedAttr,
  ParsedStartTag,
  ParsedEndTag,
  ParsedContent,
} from '@rosem/xml-parser/node'
import SVGParser, {
  convertElementArrayToRegExp,
  SVGParserOptions,
} from '@rosem/svg-parser/SVGParser'
import HTMLProcessor from './HTMLProcessor'
import getStackedTagRegExp from './getStackedTagRegExp'

export type SourceSupportedType =
  | 'application/mathml+xml'
  | 'text/html'
  | 'application/xml'
  | 'application/xhtml+xml'
  | 'image/svg+xml'

export type HTMLParserElementConfig = {
  htmlForeignElement: RegExp | string[]
  voidElement: RegExp | string[]
  rawTextElement: RegExp | string[]
  escapableRawTextElement: RegExp | string[]
}

export type HTMLParserOptions = HTMLParserElementConfig & SVGParserOptions

export const defaultNamespaceMap: NamespaceMap = {
  html: HTML_NAMESPACE,
  math: MATHML_NAMESPACE,
}

const defaultOptions: HTMLParserElementConfig = {
  htmlForeignElement: foreignElementRegExp,
  voidElement: voidElementRegExp,
  rawTextElement: rawTextElementRegExp,
  escapableRawTextElement: escapableRawTextElementRegExp,
}

export default class HTMLParser<T extends HTMLParserOptions>
  extends SVGParser<T>
  implements HTMLProcessor {
  protected readonly defaultNamespaceURI: string = HTML_NAMESPACE
  protected namespaceURI: string = HTML_NAMESPACE
  protected activeProcessor: HTMLProcessor = this

  constructor(options?: Partial<T>, extensionsMap?: XMLProcessorMap) {
    super(
      {
        ...options,
        ...{
          htmlForeignElement: convertElementArrayToRegExp(
            (options || defaultOptions).htmlForeignElement ||
              defaultOptions.htmlForeignElement
          ),
          voidElement: convertElementArrayToRegExp(
            (options || defaultOptions).voidElement ||
              defaultOptions.voidElement
          ),
          rawTextElement: convertElementArrayToRegExp(
            (options || defaultOptions).rawTextElement ||
              defaultOptions.rawTextElement
          ),
          escapableRawTextElement: convertElementArrayToRegExp(
            (options || defaultOptions).escapableRawTextElement ||
              defaultOptions.escapableRawTextElement
          ),
        },
      } as T,
      extensionsMap
    )

    Object.assign(this.defaultNamespaceMap, defaultNamespaceMap)
    this.addProcessor(TEXT_HTML_MIME_TYPE, HTML_NAMESPACE, HTMLParser.prototype)
    this.addProcessor(
      APPLICATION_MATHML_XML_MIME_TYPE,
      MATHML_NAMESPACE,
      XMLParser.prototype
    )
    this.addInstruction(this.parseRawText, this.text, 2)
    this.addInstruction(this.parseConditionalComment, this.comment, 4)
  }

  parseFromString(source: string, type: string = TEXT_HTML_MIME_TYPE): void {
    super.parseFromString(source, type)
  }

  protected useProcessor(namespaceURI: string = HTML_NAMESPACE): void {
    super.useProcessor(namespaceURI)
  }

  isForeignElement(tagName: string): boolean {
    return (this.options.htmlForeignElement as RegExp).test(tagName)
  }

  isVoidElement(parsedStartTag: ParsedStartTag): boolean {
    return (
      super.isVoidElement(parsedStartTag) ||
      (this.options.voidElement as RegExp).test(parsedStartTag.name)
    )
  }

  isAnyRawTextElement(tagName: string): boolean {
    return (
      (this.options.rawTextElement as RegExp).test(tagName) ||
      (this.options.escapableRawTextElement as RegExp).test(tagName)
    )
  }

  startsWithInstruction(source: string): boolean {
    return (
      super.startsWithInstruction(source) ||
      conditionalCommentStartRegExp.test(source)
    )
  }

  protected get lastTagNameLowerCased(): string {
    return this.tagStack.length > 0
      ? this.tagStack[this.tagStack.length - 1].nameLowerCased
      : ''
  }

  parseConditionalComment(): ParsedContent | void {
    const matchArray: RegExpMatchArray | null = this.source.match(
      conditionalCommentRegExp
    )

    if (matchArray) {
      const parsedContent: ParsedContent = {
        content: matchArray[1],
        matchStart: this.cursor,
        matchEnd: this.cursor + matchArray[0].length,
      }

      this.moveCursor(matchArray[0].length)

      return parsedContent
    }
  }

  parseRawText(): ParsedContent | void {
    const lastTagNameLowerCased = this.lastTagNameLowerCased

    if (this.isAnyRawTextElement(lastTagNameLowerCased)) {
      let parsedRawText: ParsedContent | undefined = undefined
      const stackedTagRE = getStackedTagRegExp(lastTagNameLowerCased)

      this.source.replace(
        stackedTagRE,
        (all: string, text: string): string => {
          parsedRawText = {
            content: text.slice(
              Number(shouldIgnoreFirstNewline(lastTagNameLowerCased, text))
            ),
            matchStart: this.cursor,
            matchEnd: this.cursor + text.length,
          }

          this.moveCursor(text.length)

          return ''
        }
      )
      // Parse end tag
      // this.instructionIndex = 6

      // Ensure we don't have an empty string,
      // otherwise treat all content as raw text if end tag wasn't found
      if (!parsedRawText || !(parsedRawText as ParsedContent).content) {
        parsedRawText = {
          content: this.source,
          matchStart: this.cursor,
          matchEnd: this.cursor + this.source.length,
        }
        this.moveCursor(this.source.length)
      }

      return parsedRawText
    }
  }

  matchingStartTagMissed(endTag: ParsedEndTag): ParsedEndTag | void {
    if (/^(br|p)$/.test(endTag.name)) {
      const isVoid: boolean = endTag.name.length !== 1

      this.startTag({
        ...endTag,
        namespaceURI: this.namespaceURI,
        attrs: [],
        void: isVoid,
        unarySlash: '',
        matchEnd: endTag.matchStart,
      })
      this.moveCursor(endTag.matchEnd - endTag.matchStart)

      if (!isVoid) {
        this.endTag(endTag)

        return endTag
      }

      this.nextToken()
    } else if (
      !this.options.suppressWarnings &&
      voidElementRegExp.test(endTag.name)
    ) {
      this.warn(`Wrong closed void element <${endTag.name}>`, {
        matchStart: endTag.matchStart,
        matchEnd: endTag.matchEnd,
      })
      this.moveCursor(endTag.matchEnd - endTag.matchStart)
      this.nextToken()
    } else {
      return super.matchingStartTagMissed(endTag)
    }
  }

  matchingEndTagMissed(stackTag: ParsedStartTag): ParsedEndTag | void {
    if (optionalClosingElementRegExp.test(stackTag.name)) {
      this.endTag({
        ...stackTag,
        matchStart: this.cursor,
        matchEnd: this.cursor,
      })
    } else {
      super.matchingEndTagMissed(stackTag)
    }
  }

  startTag<T extends ParsedStartTag>(parsedStartTag: T): void {
    const lastTagNameLowerCased: string = this.lastTagNameLowerCased
    const tagNameLowerCased = parsedStartTag.nameLowerCased

    if (
      lastTagNameLowerCased === 'p' &&
      nonPhrasingElementRegExp.test(tagNameLowerCased)
    ) {
      this.endTag({
        ...parsedStartTag,
        matchStart: this.cursor,
        matchEnd: this.cursor,
      })
      this.tagStack.pop()
    } else if (
      optionalClosingElementRegExp.test(tagNameLowerCased) &&
      lastTagNameLowerCased === tagNameLowerCased
    ) {
      this.endTag({
        ...parsedStartTag,
        matchStart: this.cursor,
        matchEnd: this.cursor,
      })
      this.tagStack.pop()
    } else if (
      //todo optimize
      optionalClosingElementRegExp.test(lastTagNameLowerCased) &&
      !optionalClosingElementRegExp.test(tagNameLowerCased)
    ) {
      if (this.tagStack.length > 1) {
        // Close optional elements up to the stack
        for (
          let lastIndex = this.tagStack.length - 1;
          lastIndex >= 0;
          --lastIndex
        ) {
          const stackTag: ParsedStartTag = this.tagStack[lastIndex]

          if (optionalClosingElementRegExp.test(stackTag.name)) {
            this.endTag({
              ...stackTag,
              matchStart: this.cursor,
              matchEnd: this.cursor,
            })
          } else {
            // Remove the open elements from the stack
            this.tagStack.splice(
              lastIndex + 1,
              this.tagStack.length - lastIndex - 1
            )

            break
          }
        }
      }
    }

    if (shouldIgnoreFirstNewline(parsedStartTag.name, this.source)) {
      this.moveCursor(1)
    }

    super.startTag(parsedStartTag)
  }

  attribute<T extends ParsedAttr>(attr: T): void {
    if (!this.options.suppressWarnings && reservedAttrRegExp.test(attr.name)) {
      this.warn(`Attribute name reserved: ${attr.name}`, {
        matchStart: attr.matchStart,
        matchEnd: attr.matchEnd,
      })
    }

    super.attribute(attr)
  }
}
