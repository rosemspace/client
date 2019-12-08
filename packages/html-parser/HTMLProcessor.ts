import SVGProcessor from './SVGProcessor'
import { Content } from './nodes'

export default interface HTMLProcessor extends SVGProcessor {
  // documentType(type: string): void

  parseConditionalComment(): Content | void

  parseRawText(): Content | void

  isAnyRawTextElement(tagName: string): boolean
}
