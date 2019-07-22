export { default, XMLParserOptions } from './XMLParser'
export { default as HookList } from './HookList'
export { default as BlankModule } from './BlankModule'
export { default as XMLProcessor, XMLProcessorMap } from './XMLProcessor'
export {
  encodeAttrEntities,
  decodeAttrEntities,
  ATTRIBUTE_ENTITY_DECODING_MAP,
} from './attrEntities'

export type NamespaceMap = {
  [namespacePrefix: string]: string
}

export type TypeMap = {
  [type: string]: string
}
