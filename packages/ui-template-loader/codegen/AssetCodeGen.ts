import { parse, UrlWithStringQuery } from 'url'
import { BlankModule } from '@rosemlabs/html-parser-old'
import { Attr } from '@rosemlabs/html-parser-old/nodes'
import { ATTR_SYNTAX_KEYWORDS } from '../index'

export const transformAssetUrls: { [tagName: string]: string[] } = {
  audio: ['src'],
  embed: ['src'],
  img: ['src', 'srcset'],
  image: ['xlink:href', 'href'],
  input: ['src'],
  link: ['href'], //todo only for stylesheets
  object: ['data'],
  script: ['src'],
  source: ['src', 'srcset'],
  track: ['src'],
  use: ['xlink:href', 'href'], //todo only for external resource
  video: ['src', 'poster'],
}
const modulePathRegExp = /^[.~@]|^import:|^[^/#]/i
const modulePathRemovePrefixRegExp = /^~\/?|^import:/i

function urlToRequire(url: string) {
  const { hash, path }: UrlWithStringQuery = parse(url)

  return `require("${hash ? `${path}")+"${hash}"` : `${url}")`}`
}
//todo an option enableJavaScriptURLs
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
