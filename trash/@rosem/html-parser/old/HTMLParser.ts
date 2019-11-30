import { NodeName, NodeType } from '@rosemlabs/dom-api'
import {
  conditionalCommentRegExp,
  conditionalCommentStartRegExp,
  escapableRawTextElementRegExp,
  foreignElementRegExp,
  nonPhrasingElementRegExp,
  optionalClosingElementRegExp,
  rawTextElementRegExp,
  shouldIgnoreFirstNewline,
  voidElementRegExp,
} from '@rosemlabs/html-util'
import { reservedAttributeRegExp } from '@rosemlabs/html-util/attr'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  HTML_NAMESPACE,
  MATHML_NAMESPACE,
  TEXT_HTML_MIME_TYPE,
} from '@rosemlabs/w3-util'
import HTMLProcessor from './HTMLProcessor'
import XMLParser, {
  getStackedTagRegExp,
  NamespaceMap,
  XMLProcessorMap,
} from './index'
import { Attr, Content, Element } from './node'
import SVGParser, {
  convertElementArrayToRegExp,
  SVGParserOptions,
} from './SVGParser'

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

  isForeignElement(element: string): boolean {
    return (this.options.htmlForeignElement as RegExp).test(element)
  }

  isVoidElement(element: Element): boolean {
    return (
      super.isVoidElement(element) ||
      (this.options.voidElement as RegExp).test(element.tagName)
    )
  }

  isAnyRawTextElement(element: string): boolean {
    return (
      (this.options.rawTextElement as RegExp).test(element) ||
      (this.options.escapableRawTextElement as RegExp).test(element)
    )
  }

  startsWithInstruction(source: string): boolean {
    return (
      super.startsWithInstruction(source) ||
      conditionalCommentStartRegExp.test(source)
    )
  }

  protected get lastTagName(): string {
    return this.tagStack.length > 0
      ? this.tagStack[this.tagStack.length - 1].tagName
      : ''
  }

  parseConditionalComment(): Content | void {
    const matchArray: RegExpMatchArray | null = this.source.match(
      conditionalCommentRegExp
    )

    if (matchArray) {
      const content: Content = {
        nodeType: NodeType.COMMENT_NODE,
        nodeName: NodeName.COMMENT_NODE,
        textContent: matchArray[1],
        __starts: this.sourceCursor,
        __ends: this.sourceCursor + matchArray[0].length,
      }

      this.moveSourceCursor(matchArray[0].length)

      return content
    }
  }

  parseRawText(): Content | void {
    const lastTagName = this.lastTagName

    if (this.isAnyRawTextElement(lastTagName)) {
      let rawText: Content | undefined
      const stackedTagRE = getStackedTagRegExp(lastTagName)

      this.source.replace(stackedTagRE, (all: string, text: string): string => {
        rawText = {
          nodeType: NodeType.TEXT_NODE,
          nodeName: NodeName.TEXT_NODE,
          textContent: text.slice(
            Number(shouldIgnoreFirstNewline(lastTagName, text))
          ),
          __starts: this.sourceCursor,
          __ends: this.sourceCursor + text.length,
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
            nodeType: NodeType.TEXT_NODE,
            nodeName: NodeName.TEXT_NODE,
            textContent: this.source,
            __starts: this.sourceCursor,
            __ends: this.sourceCursor + this.source.length,
          }
          this.moveSourceCursor(this.source.length)

          return rawText
        }
      }
      // Ensure we don't have an empty string
      else if ((rawText as Content).textContent) {
        return rawText
      }

      // Continue parsing to next token if we have an empty string
    }
  }

  matchingStartTagMissed(element: Element): Element | void {
    if (/^(br|p)$/.test(element.tagName)) {
      const isVoid: boolean = element.tagName.length !== 1

      this.startElement({
        ...element,
        namespaceURI: this.namespaceURI,
        attrs: [] as any,
        void: isVoid,
        unarySlash: '',
        __ends: element.__starts,
      })
      this.moveSourceCursor(element.__ends - element.__starts)
      this.endTag(element)

      if (isVoid) {
        this.resetInstructionPointer()
      }

      return element
    } else if (
      !this.options.suppressWarnings &&
      voidElementRegExp.test(element.tagName)
    ) {
      this.warn(`Wrong closed void element <${element.tagName}>`, {
        __starts: element.__starts,
        __ends: element.__ends,
      })
      this.moveSourceCursor(element.__ends - element.__starts)
      this.resetInstructionPointer()
    } else {
      return super.matchingStartTagMissed(element)
    }
  }

  matchingEndTagMissed(element: Element): Element | void {
    if (optionalClosingElementRegExp.test(element.tagName)) {
      this.endTag({
        ...element,
        start: this.sourceCursor,
        end: this.sourceCursor,
      })
    } else {
      super.matchingEndTagMissed(element)
    }
  }

  startTagFound(element: Element): void {
    const lastTagName: string = this.lastTagName
    const tagName = element.tagName

    if (lastTagName === 'p' && nonPhrasingElementRegExp.test(tagName)) {
      this.endTag({
        ...element,
        start: this.sourceCursor,
        end: this.sourceCursor,
      })
      this.tagStack.pop()
    } else if (
      optionalClosingElementRegExp.test(tagName) &&
      lastTagName === tagName
    ) {
      this.endTag({
        ...element,
        start: this.sourceCursor,
        end: this.sourceCursor,
      })
      this.tagStack.pop()
    } else if (
      //todo optimize
      optionalClosingElementRegExp.test(lastTagName) &&
      !optionalClosingElementRegExp.test(tagName)
    ) {
      if (this.tagStack.length > 1) {
        // Close optional elements up to the stack
        for (
          let lastIndex = this.tagStack.length - 1;
          lastIndex >= 0;
          --lastIndex
        ) {
          const stackTag: Element = this.tagStack[lastIndex]

          if (optionalClosingElementRegExp.test(stackTag.tagName)) {
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

    if (shouldIgnoreFirstNewline(element.tagName, this.source)) {
      this.moveSourceCursor(1)
    }

    super.startTagFound(element)
  }

  attribute<T extends Attr>(attr: T): void {
    if (!this.options.suppressWarnings && reservedAttributeRegExp.test(attr.name)) {
      this.warn(`Attribute name reserved: ${attr.name}`, {
        __starts: attr.__starts,
        __ends: attr.__ends,
      })
    }

    super.attribute(attr)
  }
}
