import { forEach } from 'lodash-es'
import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import { stringifyRequest } from 'loader-utils'
import qs from 'querystring'
import SFCSection from '../SFCSection'
import SFCDescriptor from '../SFCDescriptor'
import attrsToQuery from './attrsToQuery'

export default function generateSectionsCode(
  loaderContext: LoaderContext,
  descriptor: SFCDescriptor
): string {
  let code = ''

  forEach(descriptor, (sections: SFCSection[], name: string): void => {
    code += `\n/* ${sections[0].nameLowerCased} sections */\n` +
    sections
      .map((section, index) => {
        // const srcAttrValue =
        const src = section.attrMap.src || loaderContext.resourcePath
        const attrsQuery = attrsToQuery(section.attrs)
        const issuerQuery = section.attrMap.src
          ? `&issuerPath=${qs.escape(loaderContext.resourcePath)}`
          : ''
        const inheritQuery = loaderContext.resourceQuery
          ? `&${loaderContext.resourceQuery.slice(1)}`
          : ''
        const query = `?sfc&section=${qs.escape(
          section.nameLowerCased
        )}&index=${index}${issuerQuery}${attrsQuery}${inheritQuery}`

        return `import ${
          section.nameLowerCased
          }${index} from ${stringifyRequest(loaderContext, src + query)}`
        // + `\nif (typeof section${i} === 'function') section${i}(component)`
      })
      .join(`\n`) +
    `\n`
  })

  //export default {}
  return code
}
