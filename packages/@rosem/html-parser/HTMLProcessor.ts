import SVGProcessor from '@rosem/svg-parser/SVGProcessor'
import { ParsedContent } from '@rosem/xml-parser/node'

export default interface HTMLProcessor extends SVGProcessor {
  parseConditionalComment(): ParsedContent | void

  parseRawText(): ParsedContent | void

  isAnyRawTextElement(tagName: string): boolean
}
