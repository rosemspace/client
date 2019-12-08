import XMLProcessor from './XMLProcessor'

export default interface SVGProcessor extends XMLProcessor {
  isForeignElement(tagName: string): boolean
}
