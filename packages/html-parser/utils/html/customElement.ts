/**
 * Unicode characters used for parsing HTML custom element names. Using
 * https://html.spec.whatwg.org/multipage/custom-elements.html#prod-pcenchar.
 * Skipping \u10000-\uEFFFF (emoji) due to it freezing up PhantomJS.
 * Avoid compression of unicode sequences by using regexp instead of string
 */
export const pcenCharRegExp = /[-.0-9_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/ //\u10000-\uEFFFF/

export const reservedPotentialCustomElementNames: string[] = [
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
]

export const reservedPCENRegExp = /^(?:annotation-xml|color-profile|font-face(?:-(?:src|uri|format|name))?|missing-glyph)$/

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
export const pcenRegExp = new RegExp(
  `^(?!annotation-xml$|color-profile$|font-face(?:-(?:src|uri|format|name))?$|missing-glyph$)[a-z]${pcenCharRegExp.source}*-${pcenCharRegExp.source}*$`
)

export const isReservedPotentialCustomElementName = (name: string): boolean =>
  reservedPCENRegExp.test(name)

export const isPotentialCustomElementName = (string: string): boolean =>
  pcenRegExp.test(string)
