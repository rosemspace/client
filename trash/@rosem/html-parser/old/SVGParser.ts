import isArray from 'lodash/isArray'
import { getExactDisjunctionRegExpFromArray } from '@rosemlabs/regexp-util'
import { foreignElementRegExp } from '@rosemlabs/svg-util'
import {
  IMAGE_SVG_XML_MIME_TYPE,
  SVG_DEFAULT_NAMESPACE_MAP,
  SVG_NAMESPACE,
} from '@rosemlabs/w3-util'
import XMLParser, { XMLParserOptions, XMLProcessorMap } from './index'
import { Element } from './node'
import SVGProcessor from './SVGProcessor'

export function convertElementArrayToRegExp(list: RegExp | string[]): RegExp {
  if (isArray(list)) {
    return getExactDisjunctionRegExpFromArray(list, 'i')
  }

  return list
}

type SVGParserElementOptions = {
  svgForeignElement: RegExp | string[]
}

export type SVGParserOptions = Partial<SVGParserElementOptions> &
  XMLParserOptions

const defaultOptions: SVGParserElementOptions = {
  svgForeignElement: foreignElementRegExp,
}

export default class SVGParser<T extends SVGParserOptions = SVGParserOptions>
  extends XMLParser<T>
  implements SVGProcessor {
  protected readonly defaultNamespaceURI: string = SVG_NAMESPACE
  protected namespaceURI: string = SVG_NAMESPACE
  protected activeProcessor: SVGProcessor = this

  constructor(options?: T, extensionsMap?: XMLProcessorMap) {
    super(options, extensionsMap)

    this.options.svgForeignElement = convertElementArrayToRegExp(
      (options || defaultOptions).svgForeignElement ||
        defaultOptions.svgForeignElement
    )

    Object.assign(this.defaultNamespaceMap, SVG_DEFAULT_NAMESPACE_MAP)
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
    return (this.options.svgForeignElement as RegExp).test(tagName)
  }

  startTagFound(element: Element): void {
    super.startTagFound(element)

    if (
      !element.void &&
      this.activeProcessor.isForeignElement.call(this, element.tagName)
    ) {
      // Switch parser for foreign tag
      this.rootTagStack.push(element)

      if (
        null !=
        (this.namespaceURI = element.namespaceURI = this.namespaceMap[
          element.tagName
        ])
      ) {
        this.useProcessor(this.namespaceURI)
      }
    }
  }
}
