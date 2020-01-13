import svgAttrsAdjustmentMap from './adjustment/svgAttrsAdjustmentMap.json'
import svgTagNamesAdjustmentMap from './adjustment/svgTagNamesAdjustmentMap.json'

// https://html.spec.whatwg.org/multipage/parsing.html#adjust-svg-attributes
export function adjustSVGAttribute(name: string): string {
  return (svgAttrsAdjustmentMap as Record<string, string>)[name] ?? name
}

// https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
export function adjustSVGTagName(name: string): string {
  return (svgTagNamesAdjustmentMap as Record<string, string>)[name] ?? name
}
