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
const modulePathRegExp: RegExp = /^[.~@]|^import:/i
const modulePathRemovePrefixRegExp: RegExp = /^~|^import:/i

function wrapInRequire(source: string) {
  return `require(${source})`
}

export default class AssetCodeGen extends BlankModule {
  attribute<T extends Attr>(attr: T): void {
    const ownerElementTagName: string = attr.ownerElement.nameLowerCased
    const attrValue = attr.value

    if (
      tagAttrMap[ownerElementTagName] &&
      tagAttrMap[ownerElementTagName].includes(attr.nameLowerCased) &&
      modulePathRegExp.test(attrValue) &&
      // Ignore SVG <symbol> references
      ('xlink:href' !== attr.nameLowerCased || !attrValue.startsWith('#'))
    ) {
      attr.prefix = ATTR_SYNTAX_KEYWORDS.bind.fullName
      attr.name = `${attr.prefix}:${attr.localName}`
      attr.nameLowerCased = attr.name.toLowerCase()
      attr.value =
        'srcset' === attr.localName
          ? attrValue
              .trim()
              .split(',')
              .map((src: string): string => {
                const parts: string[] = src
                  .trim()
                  .split(/\s+/)
                  .map((part: string): string => stringify(` ${part}`))

                parts[0] = wrapInRequire(
                  `"${parts[0]
                    .slice(2)
                    .replace(modulePathRemovePrefixRegExp, '')}`
                )

                return parts.join('+')
              })
              .join(',')
          : wrapInRequire(
              stringify(attrValue.replace(modulePathRemovePrefixRegExp, ''))
            )
    }
  }
}
