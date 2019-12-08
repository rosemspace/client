import { StartTag } from '@rosemlabs/html-parser/nodes'
import { RawSourceMap } from 'source-map'

// name, lang, index, src, meta, data
export default interface SFCBlock<Data = any> extends StartTag {
  id: string
  map?: RawSourceMap
  data: Data
  // If src attribute is presented.
  // Full name in dev mode only
  file?: string
  // type?: string // instead of lang
  // src?: string
  // global?: boolean // instead of "scoped", should be scoped by default
  // module?: string | boolean
}
