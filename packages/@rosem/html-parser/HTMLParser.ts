import isProduction from '@rosem-util/env/isProduction'
import {
  conditionalCommentStartRegExp,
  conditionalCommentRegExp,
  nonPhrasingElementRegExp,
  voidElementRegExp,
  optionalClosingElementRegExp,
  foreignElementRegExp,
  isAnyRawTextElement,
  shouldIgnoreFirstNewline,
} from '@rosem-util/syntax-html'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  TEXT_HTML_MIME_TYPE,
} from '@rosem-util/w3/mimeTypes'
import {
  HTML_NAMESPACE,
  MATHML_NAMESPACE
} from '@rosem-util/w3/namespaces'
import SVGParser from '@rosem/svg-parser/SVGParser'
import { ProcessorMap } from '@rosem/xml-parser/Processor'
import ParsedStartTag from '@rosem/xml-parser/node/ParsedStartTag'
import ParsedEndTag from '@rosem/xml-parser/node/ParsedEndTag'
import ParsedContent from '@rosem/xml-parser/node/ParsedContent'
import XMLParser, { XMLParserOptions } from '@rosem/xml-parser/XMLParser'
import getStackedTagRegExp from './getStackedTagRegExp'

const isNotProduction = !isProduction

export type SourceSupportedType =
  | 'application/mathml+xml'
  | 'text/html'
  | 'application/xml'
  | 'application/xhtml+xml'
  | 'image/svg+xml'

export default class HTMLParser extends SVGParser {
  protected readonly defaultNamespaceURI: string = HTML_NAMESPACE
  protected namespaceURI: string = HTML_NAMESPACE

  constructor(options?: XMLParserOptions, extensionsMap?: ProcessorMap) {
    super(options, extensionsMap)

    this.addNamespace('html', HTML_NAMESPACE)
    this.addNamespace('math', MATHML_NAMESPACE)
    this.addProcessor(TEXT_HTML_MIME_TYPE, HTML_NAMESPACE, HTMLParser.prototype)
    this.addProcessor(
      APPLICATION_MATHML_XML_MIME_TYPE,
      MATHML_NAMESPACE,
      XMLParser.prototype
    )
    this.addInstruction(this.parseConditionalComment, this.comment, 4)
    this.addInstruction(this.parseRawText, this.text, 7)
  }

  parseFromString(source: string, type: string = TEXT_HTML_MIME_TYPE): void {
    super.parseFromString(source, type)
  }

  protected useProcessor(namespaceURI: string = HTML_NAMESPACE): void {
    super.useProcessor(namespaceURI)
  }

  isForeignElement(tagName: string): boolean {
    return foreignElementRegExp.test(tagName)
  }

  isVoidElement(parsedTag: ParsedStartTag): boolean {
    return (
      super.isVoidElement(parsedTag) || voidElementRegExp.test(parsedTag.name)
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

  protected parseConditionalComment(): ParsedContent | void {
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

  protected parseRawText(): ParsedContent | void {
    const lastTagNameLowerCased = this.lastTagNameLowerCased

    if (isAnyRawTextElement(lastTagNameLowerCased)) {
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
    } else if (isNotProduction && voidElementRegExp.test(endTag.name)) {
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
        name: stackTag.name,
        nameLowerCased: stackTag.nameLowerCased,
        matchStart: this.cursor,
        matchEnd: this.cursor,
      })
    } else {
      super.matchingEndTagMissed(stackTag)
    }
  }

  public startTag<T extends ParsedStartTag>(parsedStartTag: T): void {
    const lastTagNameLowerCased: string = this.lastTagNameLowerCased
    const tagNameLowerCased = parsedStartTag.nameLowerCased

    if (
      lastTagNameLowerCased === 'p' &&
      nonPhrasingElementRegExp.test(tagNameLowerCased)
    ) {
      this.endTag({
        name: parsedStartTag.name,
        nameLowerCased: lastTagNameLowerCased,
        matchStart: this.cursor,
        matchEnd: this.cursor,
      })
      this.tagStack.pop()
    } else if (
      optionalClosingElementRegExp.test(tagNameLowerCased) &&
      lastTagNameLowerCased === tagNameLowerCased
    ) {
      this.endTag({
        name: parsedStartTag.name,
        nameLowerCased: tagNameLowerCased,
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
              name: stackTag.name,
              nameLowerCased: stackTag.nameLowerCased,
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
}
