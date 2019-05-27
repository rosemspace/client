import Attr from '@rosem/xml-parser/node/Attr'
import { StartTag, Content } from '@rosem/xml-parser/node'

export default interface SFCSection extends StartTag {
  attrMap: {[name: string]: Attr}
  text: Content
  // type?: string // instead of lang
  // src?: string
  // global?: boolean // instead of "scoped", should be scoped by default
  // module?: string | boolean
}
