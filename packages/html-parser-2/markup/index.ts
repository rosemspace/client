import {
  CDATASection,
  Comment,
  DocumentType,
  ProcessingInstruction
} from '../index'

//todo move to parsers
export type DocumentTypeHook = <U extends DocumentType>(documentType: U) => any
export type ProcessingInstructionHook = <U extends ProcessingInstruction>(
  processingInstruction: U
) => any
export type CommentHook = <U extends Comment>(comment: U) => any
export type CDATASectionHook = <U extends CDATASection>(cDATASection: U) => any

export { default as StartTagParser } from './StartTagParser'
export * from './StartTagParser'
export { default as EndTagParser } from './EndTagParser'
export * from './EndTagParser'
export { default as TextParser } from './TextParser'
export * from './TextParser'
