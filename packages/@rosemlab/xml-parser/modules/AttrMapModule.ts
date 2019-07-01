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
  attribute<T extends Attr, U extends StartTag>(attr: T, startTag: U): void {
    const name: string = attr.name
    const value: string = attr.value

    if (
      '' === value ||
      name.toLocaleLowerCase() === value.toLocaleLowerCase()
    ) {
      startTag.attrMap![camelCase(name)] = true
    } else {
      const numericValue: number = parseFloat(value)

      startTag.attrMap![camelCase(name)] = isNaN(numericValue)
        ? value
        : numericValue
    }
  }

  startTag<T extends StartTag>(startTag: T): void {
    startTag.attrMap = {}
  }
}
