import SVGProcessor from '@rosem/svg-parser/SVGProcessor'
import { Content } from '@rosem/xml-parser/node'

export default interface HTMLProcessor extends SVGProcessor {
  parseConditionalComment(): Content | void

  parseRawText(): Content | void

  isAnyRawTextElement(tagName: string): boolean
}
