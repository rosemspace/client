import { foreignElementRegExp } from '@rosem/svg-syntax'
import {
  IMAGE_SVG_XML_MIME_TYPE,
  SVG_NAMESPACE,
  XLINK_NAMESPACE,
} from '@rosem/w3-util'
import XMLParser, { XMLParserOptions, ProcessorMap } from '@rosem/xml-parser'

export default class SVGParser extends XMLParser {
  protected readonly defaultNamespaceURI: string = SVG_NAMESPACE
  protected namespaceURI: string = SVG_NAMESPACE

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

  isForeignElement(tagName: string): boolean {
    return foreignElementRegExp.test(tagName)
  }
}
