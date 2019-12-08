import getStackedTokenRegExp from '@rosemlabs/regexp-util'
import {
  EndTagParserHooks,
  StartTagParserHooks,
  TextParserHooks,
} from './markup'

export { default } from './HTMLParser'
export { default as Node } from './Node'
export * from './Node'
export { default as Tokenizer } from './Tokenizer'
export * from './Tokenizer'
export * from './baseEntities'
export * from './markup'
export * from './module'

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

export type HTMLParserHooks = StartTagParserHooks &
  TextParserHooks &
  EndTagParserHooks /* & {
    xmlDeclaration?: TokenHook<Text>
    documentType?: DocumentTypeHook
    declaration?: TokenHook<Text>
    processingInstruction?: ProcessingInstructionHook
    comment?: CommentHook
    cDataSection?: CDATASectionHook
  }*/

export function getStackedTagRegExp(tagName: string): RegExp {
  return getStackedTokenRegExp(`</${tagName}[^>]*>`, tagName)
}
