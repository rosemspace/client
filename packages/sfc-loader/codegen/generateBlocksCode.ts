import { getAttrMap } from '@rosemlabs/html-parser/modules/AttrMapModule'
import { AttrMap } from '@rosemlabs/html-parser/nodes'
import camelCase from 'camelcase'
import { stringifyRequest } from 'loader-utils'
import { escape } from 'querystring'
import { loader } from 'webpack'
import { SFC_LOADER_IDENT } from '../index'
import SFCBlock from '../SFCBlock'
import SFCDescriptor from '../SFCDescriptor'
import SFCLoaderPlugin, {
  getOptions,
  SFCLoaderPluginOptions,
} from '../SFCLoaderPlugin'
import attrsToQuery from './attrsToQuery'
import LoaderContext = loader.LoaderContext

const jsonStringify = JSON.stringify
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stringify = (value: any, ignoreRootKeyList: string[] = []): string => {
  const cache: unknown[] = []

  const string: string = jsonStringify(
    value,
    function(key: string, innerValue: unknown) {
      // Ignore some unnecessary properties to reduce size of generated code
      if (ignoreRootKeyList.includes(key) && innerValue === value[key]) {
        return
      }

      if (typeof innerValue === 'object' && innerValue !== null) {
        if (cache.indexOf(innerValue) !== -1) {
          // Circular reference found, discard key
          return
        }
        // Store value in our collection
        cache.push(innerValue)
      }

      return innerValue
    },
    2
  )

  // Enable garbage collection
  cache.length = 0

  if (string) {
    return string.replace(/\n/g, '\n    ')
  }

  return string
}

const DEFAULT_EXPORT_VARIABLE_NAME = 'sfc'
// these are built-in query parameters so should be ignored if the user happen
// to add them as attrs
// `src` and `lang` will be added as internal attributes
const ignoredAttrs = ['block', 'index', 'lang', 'src', 'scopeId', 'issuerPath']

export default function generateBlocksCode(
  loaderContext: LoaderContext,
  sfcDescriptor: SFCDescriptor,
  exportName = 'default'
): string {
  const pluginOptions: SFCLoaderPluginOptions = getOptions(loaderContext)

  if (!pluginOptions) {
    throw new Error(
      `[${SFC_LOADER_IDENT} Error] ${SFCLoaderPlugin.name} is required`
    )
  }

  let isDefault = false

  if ('default' === exportName) {
    isDefault = true
    exportName = DEFAULT_EXPORT_VARIABLE_NAME
  }

  let importCode = ''
  let blocksCode = ''
  let dataCode = ''
  const { blocks } = sfcDescriptor

  for (const name in blocks) {
    // noinspection JSUnfilteredForInLoop
    if (!Object.prototype.hasOwnProperty.call(blocks, name)) {
      continue
    }

    // noinspection JSUnfilteredForInLoop
    blocksCode += `\n  "${name}": [`
    // noinspection JSUnfilteredForInLoop
    importCode +=
      `/* ${name} blocks */\n` +
      blocks[name]
        .map((block: SFCBlock, index: number) => {
          // todo: improve getAttrMap
          const attrMap: AttrMap = getAttrMap(block.attrs)
          // noinspection JSUnfilteredForInLoop
          const internalAttrMap: AttrMap<string> = {
            block: escape(name),
          }
          let src: string = loaderContext.resourcePath

          if (!attrMap.src) {
            // noinspection JSUnfilteredForInLoop
            const lang: string | number | boolean =
              attrMap.lang || pluginOptions.blockLangMap[name]

            if (null != lang) {
              internalAttrMap.lang = escape(String(lang))
            }
          }

          internalAttrMap.index = escape(String(index))

          if (attrMap.scoped) {
            internalAttrMap.scopeId = escape(sfcDescriptor.id)
          }

          // No need `lang` attribute if we have an external resource
          if (attrMap.src) {
            src = String(attrMap.src)
            internalAttrMap.issuerPath = escape(loaderContext.resourcePath)
          }

          // Ignore user attributes which are built-in
          delete attrMap[camelCase(pluginOptions.fileExtension)]
          ignoredAttrs.forEach((attrName: string): void => {
            delete attrMap[attrName]
          })

          const internalAttrsQuery: string = attrsToQuery(internalAttrMap)
          const attrsQuery: string = attrsToQuery(attrMap)
          const inheritQuery: string = loaderContext.resourceQuery
            ? `&${loaderContext.resourceQuery.slice(1)}`
            : ''
          const query = `?${pluginOptions.fileExtension}${internalAttrsQuery}${attrsQuery}${inheritQuery}`
          // noinspection JSUnfilteredForInLoop
          const blockName = `${name}${index}`

          blocksCode += `\n    ${stringify(block, ['data', 'map'])},`
          // noinspection JSUnfilteredForInLoop
          dataCode += `\n${exportName}.blocks[${jsonStringify(
            name
          )}][${jsonStringify(index)}].data = ${blockName}`

          return `import ${blockName} from ${stringifyRequest(
            loaderContext,
            src + query
          )}`
          // + `\nif (typeof block{i} === 'function') block{i}(component)`
        })
        .join(`\n`) +
      '\n'
    blocksCode += '\n  ],'
  }

  return `${importCode}\nvar ${exportName} = ${stringify(sfcDescriptor, [
    'blocks',
  ])}\n\n${exportName}.blocks = {${blocksCode}\n}\n${dataCode}\n\nexport ${
    isDefault ? `default` : ''
  } ${exportName}\n`
}
