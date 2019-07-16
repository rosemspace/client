import { BlankModule } from '@rosemlab/xml-parser'
import { Attr, StartTag } from '@rosemlab/xml-parser/nodes'

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
      attr.prefix = 'data-bind'
      attr.name = `${attr.prefix}:${attr.localName}`
      attr.nameLowerCased = attr.name.toLocaleLowerCase()
      attr.value = `require('${attr.value}')`
    }
  }
}
