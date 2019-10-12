import {
  conditionalCommentStartRegExp,
  conditionalCommentRegExp,
  foreignElementRegExp,
  nonPhrasingElementRegExp,
  optionalClosingElementRegExp,
  voidElementRegExp,
  shouldIgnoreFirstNewline,
  rawTextElementRegExp,
  escapableRawTextElementRegExp,
} from '@rosemlabs/html-syntax'
import { reservedAttrRegExp } from '@rosemlabs/html-syntax/attr'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  TEXT_HTML_MIME_TYPE,
  HTML_NAMESPACE,
  MATHML_NAMESPACE,
} from '@rosemlabs/w3-util'
import XMLParser, { NamespaceMap, XMLProcessorMap } from '@rosemlabs/xml-parser'
import { Attr, StartTag, EndTag, Content } from '@rosemlabs/xml-parser/nodes'
import SVGParser, {
  convertElementArrayToRegExp,
  SVGParserOptions,
} from '@rosemlabs/svg-parser/SVGParser'
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

export default class HTMLParser<T extends HTMLParserOptions = HTMLParserOptions>
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

  isVoidElement(startTag: StartTag): boolean {
    return (
      super.isVoidElement(startTag) ||
      (this.options.voidElement as RegExp).test(startTag.name)
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

  parseConditionalComment(): Content | void {
    const matchArray: RegExpMatchArray | null = this.source.match(
      conditionalCommentRegExp
    )

    if (matchArray) {
      const content: Content = {
        content: matchArray[1],
        start: this.sourceCursor,
        end: this.sourceCursor + matchArray[0].length,
      }

      this.moveSourceCursor(matchArray[0].length)

      return content
    }
  }

  parseRawText(): Content | void {
    const lastTagNameLowerCased = this.lastTagNameLowerCased

    if (this.isAnyRawTextElement(lastTagNameLowerCased)) {
      let rawText: Content | undefined
      const stackedTagRE = getStackedTagRegExp(lastTagNameLowerCased)

      this.source.replace(stackedTagRE, (all: string, text: string): string => {
        rawText = {
          content: text.slice(
            Number(shouldIgnoreFirstNewline(lastTagNameLowerCased, text))
          ),
          start: this.sourceCursor,
          end: this.sourceCursor + text.length,
        }
        this.moveSourceCursor(text.length)

        return ''
      })
      // Parse end tag
      // this.instructionIndex = 6

      // Treat all content as raw text if end tag wasn't found
      if (!rawText) {
        // Ensure we don't have an empty string
        if (this.source) {
          rawText = {
            content: this.source,
            start: this.sourceCursor,
            end: this.sourceCursor + this.source.length,
          }
          this.moveSourceCursor(this.source.length)

          return rawText
        }
      }
      // Ensure we don't have an empty string
      else if ((rawText as Content).content) {
        return rawText
      }

      // Continue parsing to next token if we have an empty string
    }
  }

  matchingStartTagMissed(endTag: EndTag): EndTag | void {
    if (/^(br|p)$/.test(endTag.name)) {
      const isVoid: boolean = endTag.name.length !== 1

      this.startTag({
        ...endTag,
        namespaceURI: this.namespaceURI,
        attrs: [] as any,
        void: isVoid,
        unarySlash: '',
        end: endTag.start,
      })
      this.moveSourceCursor(endTag.end - endTag.start)
      this.endTag(endTag)

      if (isVoid) {
        this.resetInstructionPointer()
      }

      return endTag
    } else if (
      !this.options.suppressWarnings &&
      voidElementRegExp.test(endTag.name)
    ) {
      this.warn(`Wrong closed void element <${endTag.name}>`, {
        start: endTag.start,
        end: endTag.end,
      })
      this.moveSourceCursor(endTag.end - endTag.start)
      this.resetInstructionPointer()
    } else {
      return super.matchingStartTagMissed(endTag)
    }
  }

  matchingEndTagMissed(stackTag: StartTag): EndTag | void {
    if (optionalClosingElementRegExp.test(stackTag.name)) {
      this.endTag({
        ...stackTag,
        start: this.sourceCursor,
        end: this.sourceCursor,
      })
    } else {
      super.matchingEndTagMissed(stackTag)
    }
  }

  startTagFound(startTag: StartTag): void {
    const lastTagNameLowerCased: string = this.lastTagNameLowerCased
    const tagNameLowerCased = startTag.nameLowerCased

    if (
      lastTagNameLowerCased === 'p' &&
      nonPhrasingElementRegExp.test(tagNameLowerCased)
    ) {
      this.endTag({
        ...startTag,
        start: this.sourceCursor,
        end: this.sourceCursor,
      })
      this.tagStack.pop()
    } else if (
      optionalClosingElementRegExp.test(tagNameLowerCased) &&
      lastTagNameLowerCased === tagNameLowerCased
    ) {
      this.endTag({
        ...startTag,
        start: this.sourceCursor,
        end: this.sourceCursor,
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
          const stackTag: StartTag = this.tagStack[lastIndex]

          if (optionalClosingElementRegExp.test(stackTag.name)) {
            this.endTag({
              ...stackTag,
              start: this.sourceCursor,
              end: this.sourceCursor,
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

    if (shouldIgnoreFirstNewline(startTag.name, this.source)) {
      this.moveSourceCursor(1)
    }

    super.startTagFound(startTag)
  }

  attribute<T extends Attr>(attr: T): void {
    if (!this.options.suppressWarnings && reservedAttrRegExp.test(attr.name)) {
      this.warn(`Attribute name reserved: ${attr.name}`, {
        start: attr.start,
        end: attr.end,
      })
    }

    super.attribute(attr)
  }
}
