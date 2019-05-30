import forEach from 'lodash/forEach'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { stringifyRequest } from 'loader-utils'
import qs from 'querystring'
import SFCBlock from '../SFCBlock'
import SFCDescriptor from '../SFCDescriptor'
import attrsToQuery from './attrsToQuery'

const stringify = JSON.stringify

const defaultLangMap: { [block: string]: string } = {
  template: 'html',
  script: 'js',
  style: 'css',
}

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
            const attrSet = block.attrSet
            // User attributes such as sfc, block, index will be ignored
            const internalAttrSet: { [name: string]: string } = {
              block: qs.escape(name),
            }

            if (attrSet.lang) {
              internalAttrSet.lang = attrSet.lang
            } else if (defaultLangMap[name]) {
              internalAttrSet.lang = defaultLangMap[name]
            }

            internalAttrSet.index = String(index)

            let src: string = loaderContext.resourcePath

            if (attrSet.src) {
              src = attrSet.src
              attrSet.src = qs.escape(loaderContext.resourcePath)
            }

            const internalAttrsQuery: string = attrsToQuery(internalAttrSet)
            const attrsQuery: string = attrsToQuery(attrSet)
            const inheritQuery: string = loaderContext.resourceQuery
              ? `&${loaderContext.resourceQuery.slice(1)}`
              : ''
            const query: string = `?sfc${internalAttrsQuery}${attrsQuery}${inheritQuery}`
            const blockName: string = `${name}${index}`

            // exportCode += `\n    ${blockName},`
            exportCode += `
    {
      attrSet: ${stringify(attrSet)},
      attrs: ${stringify(block.attrs)},
      localName: "${block.localName}",
      matchEnd: ${block.matchEnd},
      matchStart: ${block.matchStart},
      name: "${block.name}",
      nameLowerCased: "${block.nameLowerCased}",
      namespaceURI: ${stringify(block.namespaceURI)},
      prefix: ${stringify(block.prefix)},
      text: {
        content: ${blockName},
        matchEnd: ${block.text.matchEnd},
        matchStart: ${block.text.matchStart},
      },
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

  console.log(importCode + exportCode)

  return importCode + exportCode
}
