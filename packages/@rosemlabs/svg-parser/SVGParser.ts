import isArray from 'lodash/isArray'
import { getExactDisjunctionRegExpFromArray } from '@rosemlabs/regexp-util'
import { foreignElementRegExp } from './index'
import {
  IMAGE_SVG_XML_MIME_TYPE,
  SVG_NAMESPACE,
} from '@rosemlabs/w3-util'
import XMLParser, {
  XMLParserOptions,
  XMLProcessorMap,
} from '@rosemlabs/xml-parser'
import { StartTag } from '@rosemlabs/xml-parser/nodes'
import SVGProcessor from './SVGProcessor'

export function convertElementArrayToRegExp(list: RegExp | string[]): RegExp {
  if (isArray(list)) {
    return getExactDisjunctionRegExpFromArray(list, 'i')
  }

  return list
}

type SVGParserElementConfig = {
  svgForeignElement: RegExp | string[]
}

export type SVGParserOptions = SVGParserElementConfig & XMLParserOptions

export const defaultNamespaceMap = {
  svg: SVG_NAMESPACE,
}

const defaultOptions: SVGParserElementConfig = {
  svgForeignElement: foreignElementRegExp,
}

export default class SVGParser<T extends SVGParserOptions> extends XMLParser<T>
  implements SVGProcessor {
  protected readonly defaultNamespaceURI: string = SVG_NAMESPACE
  protected namespaceURI: string = SVG_NAMESPACE
  protected activeProcessor: SVGProcessor = this

  constructor(options?: Partial<T>, extensionsMap?: XMLProcessorMap) {
    super(
      {
        ...options,
        ...{
          svgForeignElement: convertElementArrayToRegExp(
            (options || defaultOptions).svgForeignElement ||
              defaultOptions.svgForeignElement
          ),
        },
      } as T,
      extensionsMap
    )

    Object.assign(this.defaultNamespaceMap, defaultNamespaceMap)
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

  startTagFound(startTag: StartTag): void {
    super.startTagFound(startTag)

    if (
      !startTag.void &&
      this.activeProcessor.isForeignElement.call(this, startTag.nameLowerCased)
    ) {
      // Switch parser for foreign tag
      this.rootTagStack.push(startTag)

      if (
        null !=
        (this.namespaceURI = startTag.namespaceURI = this.namespaceMap[
          startTag.nameLowerCased
        ])
      ) {
        this.useProcessor(this.namespaceURI)
      }
    }
  }
}
