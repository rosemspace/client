import { StartTag } from '@rosemlabs/xml-parser/nodes'
import { RawSourceMap } from 'source-map'

// name, lang, index, src, meta, output
export default interface SFCBlock extends StartTag {
  scopeId: string
  map?: RawSourceMap
  output: any
  // type?: string // instead of lang
  // src?: string
  // global?: boolean // instead of "scoped", should be scoped by default
  // module?: string | boolean
}
