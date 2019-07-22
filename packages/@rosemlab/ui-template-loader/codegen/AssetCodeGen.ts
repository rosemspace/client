import { BlankModule } from '@rosemlab/xml-parser'
import { Attr } from '@rosemlab/xml-parser/nodes'
import { ATTR_SYNTAX_KEYWORDS } from '../index'

const tagAttrMap: { [tagName: string]: string[] } = {
  video: ['src', 'poster'],
  source: ['src', 'srcset'],
  script: ['src'],
  link: ['href'],
  img: ['src', 'srcset'],
  image: ['xlink:href', 'href'],
  use: ['xlink:href', 'href'],
}

export default class AssetCodeGen extends BlankModule {
  attribute<T extends Attr>(attr: T): void {
    if (
      tagAttrMap[attr.ownerElement.nameLowerCased] &&
      tagAttrMap[attr.ownerElement.nameLowerCased].includes(attr.nameLowerCased)
    ) {
      attr.prefix = ATTR_SYNTAX_KEYWORDS.bind.fullName
      attr.name = `${attr.prefix}:${attr.localName}`
      attr.nameLowerCased = attr.name.toLowerCase()
      attr.value = `require('${attr.value}')`
    }
  }
}
