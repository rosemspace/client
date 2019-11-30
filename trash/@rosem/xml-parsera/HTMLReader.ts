import { Element } from './nodes'
import HTMLHookList from './HTMLHookList'

export default interface HTMLReader extends HTMLHookList {
  isForeignElement<T extends Element>(element: T): boolean

  isAnyRawTextElement<T extends Element>(element: T): boolean
}
