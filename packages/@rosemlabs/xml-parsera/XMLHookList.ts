import { MatchRange, Attr, Element, Content } from './nodes'

export type StartHook = (mimeType: string) => void
export type EndHook = () => void
export type ContentHook = <T extends Content>(declaration: T) => void
export type ElementHook = <T extends Element>(element: T) => void
export type AttrHook = <T extends Attr>(attr: T) => void

export default interface XMLHookList {
  start?: StartHook
  // xmlDeclaration?<T extends Content>(declaration: T): void
  declaration?: ContentHook
  processingInstruction?: ContentHook
  startTag?: ElementHook
  attribute?: AttrHook
  endTag?: ElementHook
  text?: ContentHook
  comment?: ContentHook
  cDataSection?: ContentHook
  warn?: ContentHook
  end?: EndHook
}
