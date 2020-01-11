import { getAttributeScalarValue } from '@rosemlabs/html-util'
import camelCase from 'camelcase'
import { VAttr, VElement } from '../ast'
import { HTMLParserEventMap } from '../HTMLParser'
import Tokenizer, { Module } from '../Tokenizer'

export type ElementAttrMap = {
  attributeMap?: AttrMap<string | number | boolean>
  rawAttributeMap?: AttrMap<VAttr>
}

export type AttrMap<T> = {
  [camelCasedName: string]: T
}

export type AttrMapGeneratorOptions = Partial<{
  generateRawAttributeMap: boolean
  mixAttributesMap: boolean
}>

export function camelCaseName(attrOrElement: VAttr | VElement): string {
  return attrOrElement.prefix
    ? `${camelCase(attrOrElement.prefix)}:${camelCase(attrOrElement.localName)}`
    : camelCase(attrOrElement.localName)
}

export function getAttributeMap(
  attrs: VAttr[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformer: (value: VAttr) => NonNullable<any> = (value: VAttr) => value
): AttrMap<ReturnType<typeof transformer>> {
  const attrMap: AttrMap<ReturnType<typeof transformer>> = {}

  attrs.forEach((attr: VAttr): void => {
    attrMap[camelCaseName(attr)] = transformer(attr)
  })

  return attrMap
}

export default class AttrMapGenerator implements Module<HTMLParserEventMap> {
  private options: AttrMapGeneratorOptions

  constructor(options: AttrMapGeneratorOptions) {
    this.options = options
  }

  register(tokenizer: Tokenizer<HTMLParserEventMap>): void {
    tokenizer.on('startTag', this.onStartTag.bind(this))
  }

  onStartTag<T extends VElement & ElementAttrMap>(element: T): void {
    if (this.options.mixAttributesMap) {
      Object.defineProperties(
        element.attributes,
        getAttributeMap(
          element.attributes,
          this.options.generateRawAttributeMap
            ? (attr: VAttr): PropertyDescriptor => ({
                configurable: true,
                writable: true,
                value: attr,
              })
            : (attr: VAttr): PropertyDescriptor => ({
                configurable: true,
                writable: true,
                value: getAttributeScalarValue(attr),
              })
        )
      )
    } else {
      element.attributeMap = getAttributeMap(
        element.attributes,
        getAttributeScalarValue
      )

      if (this.options.generateRawAttributeMap) {
        element.rawAttributeMap = getAttributeMap(element.attributes)
      }
    }
  }
}
