import SVGProcessor from '@rosemlabs/svg-parser/SVGProcessor'
import { Content } from '@rosemlabs/xml-parser/nodes'

export default interface HTMLProcessor extends SVGProcessor {
  // documentType(type: string): void

  parseConditionalComment(): Content | void

  parseRawText(): Content | void

  isAnyRawTextElement(tagName: string): boolean
}
