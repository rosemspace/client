import camelCase from 'lodash/camelCase'
import isNaN from 'lodash/isNaN'
import BlankModule from '../BlankModule'
import { Attr, AttrMap, StartTag } from '../nodes'

const defineProperties = Object.defineProperties

export function getAttrMap<T>(
  attrs: Attr[],
  transformer: (value: string | number | boolean) => T = (
    value: string | number | boolean
  ): T => (value as unknown) as T
): AttrMap<T> {
  const attrMap: AttrMap<T> = {}

  attrs.forEach((attr: Attr): void => {
    const name: string = attr.prefix
      ? `${camelCase(attr.prefix)}:${camelCase(attr.localName)}`
      : camelCase(attr.name)
    const value: string = attr.value
    let scalarValue: T

    if ('' === value || attr.name.toLowerCase() === value.toLowerCase()) {
      scalarValue = transformer(true)
    } else {
      const numericValue: number = globalThis.parseFloat(value)

      scalarValue = transformer(isNaN(numericValue) ? value : numericValue)
    }

    attrMap[name] = scalarValue
  })

  return attrMap
}

export default class AttrMapModule extends BlankModule {
  startTag<T extends StartTag>(startTag: T): void {
    defineProperties(
      startTag.attrs,
      getAttrMap(
        startTag.attrs,
        (value: string | number | boolean): PropertyDescriptor => ({
          configurable: true,
          writable: true,
          value,
        })
      )
    )
  }
}
