import XMLProcessor from '@rosemlab/xml-parser/XMLProcessor'

export default interface SVGProcessor extends XMLProcessor {
  isForeignElement(tagName: string): boolean
}
