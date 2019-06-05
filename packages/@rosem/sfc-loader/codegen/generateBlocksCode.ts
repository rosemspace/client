import forEach from 'lodash/forEach'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { stringifyRequest } from 'loader-utils'
import qs from 'querystring'
import SFCBlock from '../SFCBlock'
import SFCDescriptor from '../SFCDescriptor'
import attrsToQuery from './attrsToQuery'
import { SFC_KEYWORD } from '..'

const stringify = (value: any): string => {
  const string: string | undefined = JSON.stringify(value, null, 2)

  if (string) {
    return string.replace(/\n/g, '\n      ')
  }

  return string
}

const defaultLangMap: { [block: string]: string } = {
  template: 'html',
  script: 'js',
  style: 'css',
  // i18n: 'json',
}

// these are built-in query parameters so should be ignored if the user happen
// to add them as attrs
// `src` and `lang` will be added as internal attributes
const ignoredAttrs = [
  SFC_KEYWORD,
  'block',
  'index',
  'lang',
  'src',
  'issuerPath',
]

export default function generateBlocksCode(
  loaderContext: LoaderContext,
  descriptor: SFCDescriptor
): string {
  let importCode = ''
  let exportCode = '\nexport default {'

  forEach(
    descriptor,
    (blocks: SFCBlock[], name: string): void => {
      exportCode += `\n  "${name}": [`
      importCode +=
        `\n/* ${name} blocks */\n` +
        blocks
          .map((block, index) => {
            const attrSet = { ...block.attrSet! }
            const internalAttrSet: { [name: string]: string } = {
              block: qs.escape(name),
            }
            let src: string = loaderContext.resourcePath

            internalAttrSet.index = String(index)

            // No need `lang` attribute if we have external resource
            if (attrSet.src) {
              src = attrSet.src
              internalAttrSet.issuerPath = qs.escape(loaderContext.resourcePath)
            } else {
              const lang: string = attrSet.lang || defaultLangMap[name]

              if (lang) {
                internalAttrSet.lang = lang
              }
            }

            // Ignore user attributes which are built-in
            ignoredAttrs.forEach(
              (attrName: string): void => {
                delete attrSet[attrName]
              }
            )

            const internalAttrsQuery: string = attrsToQuery(internalAttrSet)
            const attrsQuery: string = attrsToQuery(attrSet)
            const inheritQuery: string = loaderContext.resourceQuery
              ? `&${loaderContext.resourceQuery.slice(1)}`
              : ''
            const query: string = `?${SFC_KEYWORD}${internalAttrsQuery}${attrsQuery}${inheritQuery}`
            const blockName: string = `${name}${index}`

            exportCode += `
    {
      attrSet: ${stringify(block.attrSet)},
      attrs: ${stringify(block.attrs)},
      content: ${blockName},
      localName: "${block.localName}",
      matchEnd: ${block.matchEnd},
      matchStart: ${block.matchStart},
      name: "${block.name}",
      nameLowerCased: "${block.nameLowerCased}",
      namespaceURI: ${stringify(block.namespaceURI)},
      prefix: ${stringify(block.prefix)},
      unarySlash: "${block.unarySlash}",
      void: ${block.void},
    },`

            return `import ${blockName} from ${stringifyRequest(
              loaderContext,
              src + query
            )}`
            // + `\nif (typeof block{i} === 'function') block{i}(component)`
          })
          .join(`\n`)
      exportCode += '\n  ],'
    }
  )
  importCode += '\n'
  exportCode += '\n}\n'

  // console.log(importCode + exportCode)

  return importCode + exportCode
}
