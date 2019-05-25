import { isArray } from 'lodash-es'
import { getExactDisjunctionRegExpFromArray } from '@rosem/regexp-util'
import { foreignElementRegExp } from '@rosem/svg-syntax'
import {
  IMAGE_SVG_XML_MIME_TYPE,
  SVG_NAMESPACE,
  XLINK_NAMESPACE,
} from '@rosem/w3-util'
import XMLParser, { XMLParserOptions, XMLProcessorMap } from '@rosem/xml-parser'
import ParsedStartTag from '@rosem/xml-parser/node/ParsedStartTag'
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
  xlink: XLINK_NAMESPACE,
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

  tagOpened(parsedStartTag: ParsedStartTag): void {
    super.tagOpened(parsedStartTag)

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
}
