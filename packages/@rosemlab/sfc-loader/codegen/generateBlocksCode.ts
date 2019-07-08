import forEach from 'lodash/forEach'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { stringifyRequest } from 'loader-utils'
import qs from 'querystring'
import SFCBlock from '../SFCBlock'
import SFCDescriptor from '../SFCDescriptor'
import attrsToQuery from './attrsToQuery'
import { getOptions, SFCLoaderPluginOptions } from '../SFCLoaderPlugin'

const stringify = (value: any): string => {
  const string: string | undefined = JSON.stringify(value, null, 2)

  if (string) {
    return string.replace(/\n/g, '\n      ')
  }

  return string
}

// these are built-in query parameters so should be ignored if the user happen
// to add them as attrs
// `src` and `lang` will be added as internal attributes
const ignoredAttrs = ['block', 'index', 'lang', 'src', 'issuerPath']

export default function generateBlocksCode(
  loaderContext: LoaderContext,
  descriptor: SFCDescriptor,
  exportName?: string
): string {
  const pluginOptions: SFCLoaderPluginOptions = getOptions(loaderContext)

  if (!pluginOptions) {
    throw new Error('[sfc-loader Error] SFCLoaderPlugin is required')
  }

  let importCode = ''
  let exportCode = `\nexport ${
    null == exportName || !exportName
      ? 'default'
      : 'default' !== exportName
      ? `let ${exportName} =`
      : exportName
  } {`

  forEach(descriptor, (blocks: SFCBlock[], name: string): void => {
    exportCode += `\n  "${name}": [`
    importCode +=
      `\n/* ${name} blocks */\n` +
      blocks
        .map((block, index) => {
          const attrMap = { ...block.attrMap! }
          const internalAttrMap: { [name: string]: string } = {
            block: qs.escape(name),
          }
          let src: string = loaderContext.resourcePath

          internalAttrMap.index = String(index)

          // No need `lang` attribute if we have external resource
          if (attrMap.src) {
            src = String(attrMap.src)
            internalAttrMap.issuerPath = qs.escape(loaderContext.resourcePath)
          } else {
            const lang: string | number | boolean =
              attrMap.lang || pluginOptions.blockLangMap[name]

            if (null != lang) {
              internalAttrMap.lang = String(lang)
            }
          }

          // Ignore user attributes which are built-in
          delete attrMap[pluginOptions.fileExtension]
          ignoredAttrs.forEach((attrName: string): void => {
            delete attrMap[attrName]
          })

          const internalAttrsQuery: string = attrsToQuery(internalAttrMap)
          const attrsQuery: string = attrsToQuery(attrMap)
          const inheritQuery: string = loaderContext.resourceQuery
            ? `&${loaderContext.resourceQuery.slice(1)}`
            : ''
          const query: string = `?${pluginOptions.fileExtension}${internalAttrsQuery}${attrsQuery}${inheritQuery}`
          const blockName: string = `${name}${index}`

          exportCode += `
    {
      attrMap: ${stringify(block.attrMap)},
      attrs: ${stringify(block.attrs)},
      content: ${stringify(block.content || '')},
      localName: "${block.localName}",
      end: ${block.end},
      start: ${block.start},
      name: "${block.name}",
      nameLowerCased: "${block.nameLowerCased}",
      namespaceURI: ${stringify(block.namespaceURI)},
      output: ${blockName},
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
  })
  importCode += '\n'
  exportCode += '\n}\n'

  return importCode + exportCode
}
