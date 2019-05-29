import forEach from 'lodash/forEach'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { stringifyRequest } from 'loader-utils'
import qs from 'querystring'
import SFCSection from '../SFCSection'
import SFCDescriptor from '../SFCDescriptor'
import attrsToQuery from './attrsToQuery'

const defaultLangMap: { [section: string]: string } = {
  template: 'html',
  script: 'js',
  style: 'css',
}

export default function generateSectionsCode(
  loaderContext: LoaderContext,
  descriptor: SFCDescriptor
): string {
  let importCode = ''
  let exportCode = '\nexport default {'

  forEach(
    descriptor,
    (sections: SFCSection[], name: string): void => {
      exportCode += `\n  "${name}": [`
      importCode +=
        `\n/* ${name} sections */\n` +
        sections
          .map(({ attrMap }, index) => {
            // User attributes sfc, section, index will be ignored
            const internalAttrMap: { [name: string]: string } = {
              section: qs.escape(name),
              lang: attrMap.lang || defaultLangMap[name],
              index: String(index),
            }

            if (!internalAttrMap.lang) {
              delete internalAttrMap.lang
              // throw new TypeError('"lang" attribute is required')
            }

            delete attrMap.lang

            let src: string = loaderContext.resourcePath

            if (attrMap.src) {
              src = attrMap.src
              attrMap.src = qs.escape(loaderContext.resourcePath)
            }

            const internalAttrsQuery: string = attrsToQuery(internalAttrMap)
            const attrsQuery: string = attrsToQuery(attrMap)
            const inheritQuery: string = loaderContext.resourceQuery
              ? `&${loaderContext.resourceQuery.slice(1)}`
              : ''
            const query: string = `?sfc${internalAttrsQuery}${attrsQuery}${inheritQuery}`
            const sectionName: string = `${name}${index}`

            exportCode += `\n    ${sectionName},`

            return `import ${sectionName} from ${stringifyRequest(
              loaderContext,
              src + query
            )}`
            // + `\nif (typeof section${i} === 'function') section${i}(component)`
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
