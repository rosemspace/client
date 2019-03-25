import isProduction from '@rosem-util/env/isProduction'
import {
  doctypeDeclarationRegExp,
  conditionalCommentRegExp,
  isAnyRawTextElement,
  shouldIgnoreFirstNewline,
  conditionalCommentStartRegExp,
  nonPhrasingElementRegExp,
  optionalClosingElementRegExp,
  foreignElementRegExp,
  voidElementRegExp,
} from '@rosem-util/syntax-html'
import namespaceMap from '@rosem/xml-parser/namespaceMap'
import XMLParser from '@rosem/xml-parser/XMLParser'
import ModuleInterface from '@rosem/xml-parser/ModuleInterface'
import ParsedStartTag from '@rosem/xml-parser/node/ParsedStartTag'
import ParsedEndTag from '@rosem/xml-parser/node/ParsedEndTag'
import ParsedContent from '@rosem/xml-parser/node/ParsedContent'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  APPLICATION_XHTML_XML_MIME_TYPE,
  APPLICATION_XML_MIME_TYPE,
  IMAGE_SVG_XML_MIME_TYPE,
  typeMap,
  SourceSupportedType,
  TEXT_HTML_MIME_TYPE,
} from './typeMap'
import getStackedTagRegExp from './getStackedTagRegExp'

const isNotProduction = !isProduction

export default class HTMLParser extends XMLParser {
  protected type?: SourceSupportedType
  protected rootTagStack: ParsedStartTag[] = []

  addModule(module: ModuleInterface): void {
    this.moduleList.push(module)
  }

  protected switchParser(type: SourceSupportedType = 'text/html'): void {
    if (type === this.type) {
      return
    }

    this.type = type

    // noinspection FallThroughInSwitchStatementJS
    switch (type) {
      case APPLICATION_XML_MIME_TYPE:
      case APPLICATION_MATHML_XML_MIME_TYPE:
        break
      case TEXT_HTML_MIME_TYPE:
      // optional tag functionality
      case APPLICATION_XHTML_XML_MIME_TYPE:
        // all other

        break
      case IMAGE_SVG_XML_MIME_TYPE:
        // foreign element

        break
      default:
        throw new TypeError(`Unsupported source MIME type: ${type}`)
    }
  }

  parseFromString(
    source: string,
    type: SourceSupportedType = 'text/html'
  ): void {
    this.source = source
    // Clear previous data
    this.tagStack = []
    this.rootTagStack = []
    this.cursor = 0
    this.switchParser(type)
    this.start(type)

    while (this.source) {
      if (this.parseProcessingInstruction()) {
        continue
      }

      if (this.parseDoctype()) {
        continue
      }

      if (this.parseComment()) {
        continue
      }

      // Character data section
      if (this.parseCDataSection()) {
        continue
      }

      // Conditional comment
      if (this.parseConditionalComment()) {
        continue
      }

      // End tag
      if (this.parseEndTag()) {
        continue
      }

      // Start tag
      if (this.parseStartTag()) {
        continue
      }

      // We are in a raw text element like <script>, <style>, <textarea> or
      // <title>
      if (this.parseRawText()) {
        continue
      }

      // Text
      this.parseText()
    }

    // Clean up any remaining tags
    // this.parseEndTag(['', '']) // todo
    this.end()
  }

  protected parseStartTag(): ParsedStartTag | void {
    const lastTagNameLowerCased: string = this.lastTagNameLowerCased
    const parsedTag: ParsedStartTag | void = super.parseStartTag()

    if (parsedTag) {
      const tagNameLowerCased = parsedTag.nameLowerCased

      if (
        lastTagNameLowerCased === 'p' &&
        nonPhrasingElementRegExp.test(tagNameLowerCased)
      ) {
        // debugger
        this.endTag({
          name: parsedTag.name,
          nameLowerCased: lastTagNameLowerCased,
          matchStart: this.cursor,
          matchEnd: this.cursor,
        })
        this.tagStack.pop()
      } else if (
        optionalClosingElementRegExp.test(tagNameLowerCased) &&
        lastTagNameLowerCased === tagNameLowerCased
      ) {
        // debugger
        this.endTag({
          name: parsedTag.name,
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
        // debugger
        if (this.tagStack.length > 1) {
          let lastIndex

          // Close optional elements up to the stack
          for (
            lastIndex = this.tagStack.length - 2;
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
                this.tagStack.length - lastIndex - 2
              )

              break
            }
          }
        }
      }

      if (shouldIgnoreFirstNewline(parsedTag.name, this.source)) {
        this.moveCursor(1)
      }

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
            }> element without namespace.`,
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
        foreignElementRegExp.test(tagNameLowerCased)
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

      this.startTag(parsedTag)

      return parsedTag
    }
  }

  protected parseDoctype(): ParsedContent | void {
    const doctypeDeclarationMatch = this.source.match(doctypeDeclarationRegExp)

    if (doctypeDeclarationMatch) {
      // Ignore doctype and move forward
      this.moveCursor(doctypeDeclarationMatch[0].length)

      return {
        content: doctypeDeclarationMatch[1],
        matchStart: this.cursor - doctypeDeclarationMatch[0].length,
        matchEnd: this.cursor,
      } as ParsedContent
    }
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

      this.comment(parsedContent)
      this.moveCursor(matchArray[0].length)

      return parsedContent
    }
  }

  protected parseRawText(): ParsedContent | void {
    if (isAnyRawTextElement(this.lastTagNameLowerCased)) {
      let parsedRawText: ParsedContent | undefined
      const lastTagNameLowerCased = this.lastTagNameLowerCased
      const stackedTagRE = getStackedTagRegExp(lastTagNameLowerCased)
      const rest = this.source.replace(
        stackedTagRE,
        (all: string, text: string, endTag: string): string => {
          this.text(
            (parsedRawText = {
              content: text.slice(
                Number(shouldIgnoreFirstNewline(lastTagNameLowerCased, text))
              ),
              matchStart: this.cursor,
              matchEnd: this.cursor + text.length,
            })
          )

          return endTag
        }
      )

      this.moveCursor(this.source.length - rest.length)

      return parsedRawText
    }
  }

  protected isVoidTag(parsedTag: ParsedStartTag): boolean {
    return super.isVoidTag(parsedTag) || voidElementRegExp.test(parsedTag.name)
  }

  protected startsWithInstruction(source: string): boolean {
    return (
      super.startsWithInstruction(source) ||
      conditionalCommentStartRegExp.test(source)
    )
  }

  protected hasMatchingStartTag(startTag: ParsedStartTag): void {
    super.hasMatchingStartTag(startTag)

    // Switch parser back before foreign tag
    if (
      startTag.nameLowerCased ===
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
        this.switchParser('text/html')
        this.namespace = undefined
      }
    }
  }

  protected hasNoMatchingStartTag(endTag: ParsedEndTag): void {
    if (/^(br|p)$/.test(endTag.name)) {
      const isVoid: boolean = endTag.name.length !== 1

      this.startTag({
        ...endTag,
        namespace: this.namespace,
        attrs: [],
        void: isVoid,
        unarySlash: '',
      })

      if (!isVoid) {
        this.endTag(endTag)
      }
    } else if (voidElementRegExp.test(endTag.name)) {
      this.warn(`Wrong closed void element <${endTag.name}>`, {
        matchStart: endTag.matchStart,
        matchEnd: endTag.matchEnd,
      })
    } else {
      super.hasNoMatchingStartTag(endTag)
    }
  }
}
