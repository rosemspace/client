import { loader } from 'webpack'
import LoaderContext = loader.LoaderContext
import generateVirtualDOMCode from './codegen/generateVirtualDOMCode'

export default function(this: LoaderContext, source: string): string | void {
  return `export default function render({ createInstance: h }) {
  return ${generateVirtualDOMCode(source)}
}
`
}
