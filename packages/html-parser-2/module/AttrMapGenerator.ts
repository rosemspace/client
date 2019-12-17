import { getAttributeScalarValue } from '@rosemlabs/html-util'
import camelCase from 'camelcase'
import { Attr, Element, HTMLParserHooks, Module } from '../index'

export type ElementAttrMap = {
  attributeMap?: AttrMap<string | number | boolean>
  rawAttributeMap?: AttrMap<Attr>
}

export type AttrMap<T> = {
  [camelCasedName: string]: T
}

export type AttrMapGeneratorOptions = Partial<{
  generateRawAttributeMap: boolean
  mixAttributesMap: boolean
}>

export function camelCaseName(attrOrElement: Attr | Element): string {
  return attrOrElement.prefix
    ? `${camelCase(attrOrElement.prefix)}:${camelCase(attrOrElement.localName)}`
    : camelCase(attrOrElement.localName)
}

export function getAttributeMap(
  attrs: Attr[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformer: (value: Attr) => NonNullable<any> = (value: Attr) => value
): AttrMap<ReturnType<typeof transformer>> {
  const attrMap: AttrMap<ReturnType<typeof transformer>> = {}

  attrs.forEach((attr: Attr): void => {
    attrMap[camelCaseName(attr)] = transformer(attr)
  })

  return attrMap
}

export default class AttrMapGenerator implements Module<HTMLParserHooks> {
  private options: AttrMapGeneratorOptions

  constructor(options: AttrMapGeneratorOptions) {
    this.options = options
  }

  onStartTag<T extends Element & ElementAttrMap>(element: T): void {
    if (this.options.mixAttributesMap) {
      Object.defineProperties(
        element.attributes,
        getAttributeMap(
          element.attributes,
          this.options.generateRawAttributeMap
            ? (attr: Attr): PropertyDescriptor => ({
                configurable: true,
                writable: true,
                value: attr,
              })
            : (attr: Attr): PropertyDescriptor => ({
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
