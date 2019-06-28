import SVGProcessor from '@rosemlab/svg-parser/SVGProcessor'
import { Content } from '@rosemlab/xml-parser/nodes'

export default interface HTMLProcessor extends SVGProcessor {
  parseConditionalComment(): Content | void

  parseRawText(): Content | void

  isAnyRawTextElement(tagName: string): boolean
}
