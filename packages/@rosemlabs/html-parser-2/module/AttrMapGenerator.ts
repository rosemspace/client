import { getAttributeScalarValue } from '@rosemlabs/html-util'
import { defineProperties } from '@rosemlabs/std'
import camelCase from 'camelcase'
import { Attr, Element, HTMLParserHooks, Plugin } from '../index'

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

export default class AttrMapGenerator implements Plugin<HTMLParserHooks> {
  private options: AttrMapGeneratorOptions

  constructor(options: AttrMapGeneratorOptions) {
    this.options = options
  }

  onStartTag<T extends Element & ElementAttrMap>(element: T): void {
    if (this.options.mixAttributesMap) {
      defineProperties(
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

export function getAttributeMap<T>(
  attrs: Attr[],
  transformer: (value: any) => T = (value: any): T => value
): AttrMap<T> {
  const attrMap: AttrMap<T> = {}

  attrs.forEach((attr: Attr): void => {
    attrMap[camelCaseName(attr)] = transformer(attr)
  })

  return attrMap
}

export function camelCaseName(attrOrElement: Attr | Element): string {
  return attrOrElement.prefix
    ? `${camelCase(attrOrElement.prefix)}:${camelCase(attrOrElement.localName)}`
    : camelCase(attrOrElement.localName)
}
