import {
  foreignElementRegExp,
  IMAGE_SVG_MIME_TYPE,
} from '@rosemlabs/html-parser/utils/html'
import { SVG_NAMESPACE } from '@rosemlabs/html-parser/utils/infra/namespaces'
import isArray from 'lodash/isArray'
import { XMLProcessorMap } from './index'
import { StartTag } from './nodes'
import SVGProcessor from './SVGProcessor'
import XMLParser, { XMLParserOptions } from './XMLParser'

export function getExactDisjunctionRegExpFromArray(
  list: string[],
  flags?: string
): RegExp {
  return new RegExp(`^${list.join('|')}$`, flags)
}

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
    this.addProcessor(IMAGE_SVG_MIME_TYPE, SVG_NAMESPACE, SVGParser.prototype)
  }

  parseFromString(source: string, type: string = IMAGE_SVG_MIME_TYPE): void {
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
