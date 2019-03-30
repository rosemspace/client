import { foreignElementRegExp } from '@rosem-util/syntax-svg'
import { IMAGE_SVG_XML_MIME_TYPE } from '@rosem-util/w3/mimeTypes'
import { SVG_NAMESPACE, XLINK_NAMESPACE } from '@rosem-util/w3/namespaces'
import { ProcessorMap } from '@rosem/xml-parser/Processor'
import XMLParser, { XMLParserOptions } from '@rosem/xml-parser/XMLParser'

export default class SVGParser extends XMLParser {
  constructor(options?: XMLParserOptions, extensionsMap?: ProcessorMap) {
    super(options, extensionsMap)

    this.addNamespace('svg', SVG_NAMESPACE)
    this.addNamespace('xlink', XLINK_NAMESPACE)
    this.addProcessor(IMAGE_SVG_XML_MIME_TYPE, 'svg', SVGParser.prototype)
  }

  parseFromString(
    source: string,
    type: string = IMAGE_SVG_XML_MIME_TYPE
  ): void {
    super.parseFromString(source, type)
  }

  protected useProcessor(type: string = IMAGE_SVG_XML_MIME_TYPE): void {
    super.useProcessor(type)
  }

  isForeignElement(tagName: string): boolean {
    return foreignElementRegExp.test(tagName)
  }
}
