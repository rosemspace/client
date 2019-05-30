import { StartTag, Content } from '@rosem/xml-parser/nodes'

// name, lang, index, src, meta, content
export default interface SFCBlock extends StartTag, Content {
  // map
  // type?: string // instead of lang
  // src?: string
  // global?: boolean // instead of "scoped", should be scoped by default
  // module?: string | boolean
}
