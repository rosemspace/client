import { StartTag } from '@rosemlabs/html-parser/nodes'
import { RawSourceMap } from 'source-map'

// name, lang, index, src, meta, output
export default interface SFCBlock extends StartTag {
  id: string
  map?: RawSourceMap
  output: any
  // type?: string // instead of lang
  // src?: string
  // global?: boolean // instead of "scoped", should be scoped by default
  // module?: string | boolean
}
