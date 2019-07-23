import { BlankModule } from '@rosemlab/xml-parser'
import { Attr } from '@rosemlab/xml-parser/nodes'
import { ATTR_SYNTAX_KEYWORDS } from '../index'

const stringify = JSON.stringify
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
    const ownerElementTagName: string = attr.ownerElement.nameLowerCased

    if (
      tagAttrMap[ownerElementTagName] &&
      tagAttrMap[ownerElementTagName].includes(attr.nameLowerCased) &&
      // Ignore SVG <symbol> references
      ('xlink:href' !== attr.nameLowerCased || !attr.value.startsWith('#'))
    ) {
      attr.prefix = ATTR_SYNTAX_KEYWORDS.bind.fullName
      attr.name = `${attr.prefix}:${attr.localName}`
      attr.nameLowerCased = attr.name.toLowerCase()
      attr.value =
        'srcset' === attr.localName
          ? attr.value
              .trim()
              .split(',')
              .map((src: string): string => {
                const parts: string[] = src
                  .trim()
                  .split(' ')
                  .map((part: string): string => stringify(` ${part}`))

                parts[0] = `require(${parts[0].replace(' ', '')})`

                return parts.join('+')
              })
              .join(',')
          : `require(${stringify(attr.value)})`
    }
  }
}
