export { default, XMLParserOptions } from './XMLParser'
export { default as HookList } from './HookList'
export { default as Module } from './Module'
export { default as XMLProcessor, XMLProcessorMap } from './XMLProcessor'
export {
  default as decodeAttrEntities,
  ATTRIBUTE_ENTITY_DECODING_MAP,
} from './decodeAttrEntities'

export type NamespaceMap = {
  [namespacePrefix: string]: string
}

export type TypeMap = {
  [type: string]: string
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
