import getStackedTokenRegExp from '@rosemlabs/regexp-util'

export { default } from './HTMLParser'
// export * from './ast'
// export { default as Tokenizer } from './Tokenizer'
// export * from './Tokenizer'
// export * from './baseEntities'
// export * from './parsers'
// export * from './modules'

export type SourceSupportedType =
  | 'application/mathml+xml'
  | 'text/html'
  | 'application/xml'
  | 'application/xhtml+xml'
  | 'image/svg+xml'

export type NamespaceMap = {
  [namespacePrefix: string]: string
}

export type TypeMap = {
  [type: string]: ChildNode
}

export function getStackedTagRegExp(tagName: string): RegExp {
  return getStackedTokenRegExp(`</${tagName}[^>]*>`, tagName)
}
