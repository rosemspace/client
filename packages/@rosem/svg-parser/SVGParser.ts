import { foreignElementRegExp } from '@rosem/svg-syntax'
import {
  IMAGE_SVG_XML_MIME_TYPE,
  SVG_NAMESPACE,
  XLINK_NAMESPACE,
} from '@rosem/w3-util'
import XMLParser, { XMLParserOptions, ProcessorMap } from '@rosem/xml-parser'
import ParsedStartTag from '@rosem/xml-parser/node/ParsedStartTag'
import SVGProcessor from './SVGProcessor'

export default class SVGParser extends XMLParser implements SVGProcessor {
  protected readonly defaultNamespaceURI: string = SVG_NAMESPACE
  protected namespaceURI: string = SVG_NAMESPACE
  protected activeProcessor: SVGProcessor = this

  constructor(options?: XMLParserOptions, extensionsMap?: ProcessorMap) {
    super(options, extensionsMap)

    this.addNamespace('svg', SVG_NAMESPACE)
    this.addNamespace('xlink', XLINK_NAMESPACE)
    this.addProcessor(
      IMAGE_SVG_XML_MIME_TYPE,
      SVG_NAMESPACE,
      SVGParser.prototype
    )
  }

  parseFromString(
    source: string,
    type: string = IMAGE_SVG_XML_MIME_TYPE
  ): void {
    super.parseFromString(source, type)
  }

  protected useProcessor(namespaceURI: string = SVG_NAMESPACE): void {
    super.useProcessor(namespaceURI)
  }

  protected pushTagToStack(parsedStartTag: ParsedStartTag): void {
    super.pushTagToStack(parsedStartTag)

    // Switch parser for foreign tag
    if (
      this.activeProcessor.isForeignElement.call(
        this,
        parsedStartTag.nameLowerCased
      )
    ) {
      if (!parsedStartTag.void) {
        this.rootTagStack.push(parsedStartTag)

        if (
          null !=
          (this.namespaceURI = parsedStartTag.namespaceURI = this.namespaceMap[
            parsedStartTag.nameLowerCased
          ])
        ) {
          this.useProcessor(this.namespaceURI)
        }
      }
    }
  }

  isForeignElement(tagName: string): boolean {
    return foreignElementRegExp.test(tagName)
  }
}
