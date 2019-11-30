import isProduction from '@rosem-util/env/isProduction'
import { foreignElementRegExp } from '@rosem-util/syntax-html'
import Processor from '@rosem/xml-parser/Processor'
import { isFunction } from 'lodash-es'
import {
  APPLICATION_MATHML_XML_MIME_TYPE,
  APPLICATION_XHTML_XML_MIME_TYPE,
  APPLICATION_XML_MIME_TYPE,
  IMAGE_SVG_XML_MIME_TYPE,
  SourceSupportedType,
  TEXT_HTML_MIME_TYPE,
  typeMap,
} from './type'
import HookList, { ParsingHook } from '@rosem/xml-parser/HookList'
import namespaceMap from '@rosem/xml-parser/namespaceMap'
import ParsedStartTag from '@rosem/xml-parser/node/ParsedStartTag'
import XMLParser, { XMLParserOptions } from '@rosem/xml-parser/XMLParser'

const isNotProduction = !isProduction

type ExtensionFactory = (options?: XMLParserOptions, extensionsMap?: ExtensionsMap) => HookList
type ExtensionsMap = { [type: string]: ExtensionFactory | HookList }

export default abstract class XMLSwitchParser extends XMLParser {
  protected type: SourceSupportedType = 'application/xml'
  protected extensionsMap: ExtensionsMap
  protected activeExtension: Processor
  protected rootTagStack: ParsedStartTag[] = []

  constructor(options?: XMLParserOptions, extensionsMap?: ExtensionsMap) {
    super(options)

    this.extensionsMap = extensionsMap || {}
    this.activeExtension = this
  }

  protected abstract isForeignElement(tagName: string): boolean

  addExtension(type: SourceSupportedType, extensionFactory: ExtensionFactory) {
    this.extensionsMap[type] = extensionFactory
  }

  public start(type: SourceSupportedType) {
    // Clear previous data
    this.rootTagStack = []
    this.useExtension(type)
    super.start(type)
  }

  protected useExtension(type: SourceSupportedType = this.type): void {
    if (type === this.type) {
      return
    }

    const extension = this.extensionsMap[type]

    if (!extension) {
      throw new TypeError(`Unsupported source MIME type: ${type}`)
    }

    this.type = type
    this.activeExtension = isFunction(extension)
      ? extension(this.options, this.extensionsMap)
      : extension

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
    }
  }

  protected matchingStartTagFound(startTag: ParsedStartTag): void {
    super.matchingStartTagFound(startTag)

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

        this.useExtension(typeMap[previousRootTag.nameLowerCased])
        this.namespace = previousRootTag.namespace
      } else {
        this.useExtension('text/html')
        this.namespace = undefined
      }
    }
  }

  public startTag: ParsingHook<ParsedStartTag> = (
    parsedStartTag: ParsedStartTag
  ): void => {
    const tagNameLowerCased = parsedStartTag.nameLowerCased

    // We don't have namespace from previous tag
    if (
      !this.namespace &&
      this.rootTagStack.length &&
      this.rootTagStack[this.rootTagStack.length - 1].namespace
    ) {
      const rootTag = this.rootTagStack[this.rootTagStack.length - 1]

      this.namespace = parsedStartTag.namespace = rootTag.namespace

      if (isNotProduction) {
        this.warn(
          `<${parsedStartTag.name}> element is not allowed in context of <${
            rootTag.name
          }> element without namespace.`,
          {
            matchStart: parsedStartTag.matchStart,
            matchEnd: parsedStartTag.matchEnd,
          }
        )
      }
    }

    // Switch parser for foreign tag
    if (
      !this.rootTagStack.length ||
      foreignElementRegExp.test(tagNameLowerCased)
    ) {
      if (!parsedStartTag.void) {
        this.rootTagStack.push(parsedStartTag)
      }

      if (typeMap[tagNameLowerCased]) {
        this.useExtension(typeMap[tagNameLowerCased])
        this.namespace = parsedStartTag.namespace =
          namespaceMap[parsedStartTag.nameLowerCased] || this.namespace
      } else {
        this.namespace = undefined
      }
    }

    super.startTag(parsedStartTag)
  }
}
