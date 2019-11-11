import { parse, UrlWithStringQuery } from 'url'
import { BlankModule } from '@rosemlabs/xml-parser'
import { Attr } from '@rosemlabs/xml-parser/nodes'
import { ATTR_SYNTAX_KEYWORDS } from '../index'

const transformAssetUrls: { [tagName: string]: string[] } = {
  video: ['src', 'poster'],
  source: ['src', 'srcset'],
  script: ['src'],
  link: ['href'],
  img: ['src', 'srcset'],
  image: ['xlink:href', 'href'],
  use: ['xlink:href', 'href'],
}
const modulePathRegExp: RegExp = /^[.~@]|^import:|^[^/#]/i
const modulePathRemovePrefixRegExp: RegExp = /^~\/?|^import:/i

function urlToRequire(url: string) {
  const { hash, path }: UrlWithStringQuery = parse(url)

  return `require("${hash ? `${path}")+"${hash}"` : `${url}")`}`
}
//todo enableJavaScriptURLs
export default class AssetCodeGen extends BlankModule {
  attribute<T extends Attr>(attr: T): void {
    const ownerElementTagName: string = attr.ownerElement.nameLowerCased
    const attrValue = attr.value

    if (
      !transformAssetUrls[ownerElementTagName] ||
      !transformAssetUrls[ownerElementTagName].includes(attr.nameLowerCased) ||
      !modulePathRegExp.test(attrValue)
    ) {
      return
    }

    if (/^javascript:/.test(attrValue)) {
      attr.value = attrValue.replace(/^javascript:/, '')
    }

    attr.prefix = ATTR_SYNTAX_KEYWORDS.bind.fullName
    attr.name = `${attr.prefix}:${attr.localName}`//.toLowerCase()
    attr.nameLowerCased = attr.name.toLowerCase()//remove
    attr.value =
      'srcset' === attr.localName
        ? attrValue
            .trim()
            .split(',')
            // Remove useless spaces
            .map((src: string): string => src.trim().replace(/\s+/g, ' '))
            // Remove empty and duplicated values
            .filter(
              (value: string, index: number, list: string[]): boolean =>
                Boolean(value) && ' ' !== value && list.indexOf(value) === index
            )
            .map((src: string): string => {
              const parts: string[] = src
                .trim()
                .split(/\s+?/)
                .map((part: string, index: number): string =>
                  index > 0 ? `" ${part}"` : part
                )

              parts[0] = urlToRequire(
                parts[0].replace(modulePathRemovePrefixRegExp, '')
              )

              return parts.join('+')
            })
            .join('+","+')
        : urlToRequire(attrValue.replace(modulePathRemovePrefixRegExp, ''))
  }
}
