import camelCase from 'lodash/camelCase'
import isNaN from 'lodash/isNaN'
import BlankModule from '../BlankModule'
import { Attr, StartTag } from '../nodes'

export type AttrMap = {
  [camelCaseName: string]: string | number | boolean
}

declare module '@rosemlab/xml-parser/nodes' {
  interface StartTag {
    attrMap?: AttrMap
  }
}

export default class AttrMapModule extends BlankModule {
  attribute<T extends Attr>(attr: T): void {
    const name: string = attr.name
    const value: string = attr.value

    if (
      '' === value ||
      name.toLowerCase() === value.toLowerCase()
    ) {
      attr.ownerElement.attrMap![camelCase(name)] = true
    } else {
      const numericValue: number = globalThis.parseFloat(value)

      attr.ownerElement.attrMap![camelCase(name)] = isNaN(numericValue)
        ? value
        : numericValue
    }
  }

  startTag<T extends StartTag>(startTag: T): void {
    startTag.attrMap = {}
  }
}
