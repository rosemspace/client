import { Content } from './nodes'
import XMLHookList from './XMLHookList'

export type TextHook = <T extends Content>(text: T, raw?: boolean) => void
export type CommentHook = <T extends Content>(
  comment: T,
  conditional?: boolean
) => void

export default interface HTMLHookList extends XMLHookList {
  text?: TextHook
  comment?: CommentHook
}
