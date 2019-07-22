export const anyCharCapturePart = '([\\s\\S]*?)'

export const processingInstructionStartRegExp = /^<\?/

export const processingInstructionRegExp = new RegExp(
  `${processingInstructionStartRegExp.source}${anyCharCapturePart}\\?>`,
  'i'
)

export const declarationStartRegExp = /^<!/

export const declarationRegExp = new RegExp(
  `${declarationStartRegExp.source}([^>]*)>`,
  'i'
)

/**
 * Unicode characters used for parsing html tags, component names and property paths.
 * Using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 *
 * avoid compression of unicode sequences by using regexp instead of string
 */
export const potentialCustomElementNameCharRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

// Non-colonized name e.g. "name"
// could use CombiningChar and Extender characters
// (https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName)
// but for ui templates we can enforce a simple charset
const ncNameRegExpPart = `[_${potentialCustomElementNameCharRegExp.source}]?[${
  potentialCustomElementNameCharRegExp.source
}][0-9\\-_\\.${potentialCustomElementNameCharRegExp.source}]*`

// Qualified name e.g. "namespace:name"
export const qualifiedNameRegExp = new RegExp(
  `^(?:(${ncNameRegExpPart}):)?(${ncNameRegExpPart})$`
)

const qualifiedNameRegExpCapturePart = `((?:(${ncNameRegExpPart})\\:)?${ncNameRegExpPart})`

export const startTagOpenRegExp = new RegExp(
  `^<${qualifiedNameRegExpCapturePart}`
)

export const startTagCloseRegExp = /^\s*(\/?)>/

// Regular expression for parsing attributes
export const attributeRegExp = /^\s*([^\s"'<>/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

export const endTagRegExp = new RegExp(
  `^<\\/(?:${qualifiedNameRegExpCapturePart})?[^>]*>`
)

// Used {2} to avoid being passed as HTML comment when inlined in a page
export const commentStartRegExp = /^<!-{2}/

export const commentRegExp = new RegExp(
  `${commentStartRegExp.source}${anyCharCapturePart}-{2}>`
)

export const cDataSectionStartRegExp = /^<!\[CDATA\[/

export const cDataSectionRegExp = new RegExp(
  `${cDataSectionStartRegExp.source}${anyCharCapturePart}]{2}>`
)

export function isFalsyAttrValue(value: any): boolean {
  return null == value || false === value
}
