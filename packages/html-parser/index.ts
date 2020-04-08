import { XMLNS_NAMESPACE } from './utils/infra/namespaces'

export { default } from './HTMLParser'
// export * from './ast'
// export { default as Tokenizer } from './Tokenizer'
// export * from './Tokenizer'
// export * from './baseEntities'
// export * from './parsers'
// export * from './modules'

type HTMLParserOptions = Partial<{
  //xml, xmlns, xlink
  attrNamespaceAdjustmentMap: Record<string, string>
  attrNamespaceAdjustmentMapStrict: Record<string, string>
  svgTagNameAdjustmentMap: Record<string, string>
  svgAttrNameAdjustmentMap: Record<string, string>
  mathmlAttrNameAdjustmentMap: Record<string, string>
}>

const htmlParserOptionsMini: HTMLParserOptions = {
  attrNamespaceAdjustmentMap: {
    xmlns: XMLNS_NAMESPACE,
  },
  mathmlAttrNameAdjustmentMap: {
    definitionurl: 'definitionURL',
  },
}

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
