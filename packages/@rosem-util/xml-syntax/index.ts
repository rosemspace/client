export const processingInstructionRegExp = /^<\?([\s\S]*?)\?>/

export function generateTokens(startName: string, endName: string) {
  return {
    start: `<!${startName}`,
    end: `${endName}>`,
  }
}

export const {
  start: conditionalCommentStartToken,
  end: conditionalCommentEndToken,
} = generateTokens('[', ']')

export const {
  start: commentStartToken,
  end: commentEndToken,
} = generateTokens('--', '--')

export const {
  start: characterDataSectionStartToken,
  end: characterDataSectionEndToken,
} = generateTokens('[CDATA[', ']]')

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
const ncNameRegExpPart = `[_${
  potentialCustomElementNameCharRegExp.source
}][\\-\\.0-9_${potentialCustomElementNameCharRegExp.source}]*`

// Qualified name e.g. "namespace:name"
export const qualifiedNameRegExp = new RegExp(
  `^(?:(${ncNameRegExpPart}):)?(${ncNameRegExpPart})$`
)

const qualifiedNameRegExpCapturePart = `((?:${ncNameRegExpPart}\\:)?${ncNameRegExpPart})`

export const startTagOpenRegExp = new RegExp(
  `^<${qualifiedNameRegExpCapturePart}`
)

export const startTagCloseRegExp = /^\s*(\/?)>/

// Regular Expressions for parsing tags and attributes
export const attributeRegExp = /^\s*([^\s"'<>/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

export const endTagRegExp = new RegExp(
  `^<\\/${qualifiedNameRegExpCapturePart}[^>]*>`
)

export const commentStartRegExp = new RegExp(`^${commentStartToken}`)

export const conditionalCommentStartRegExp = /^<!\[/

export const commentRegExp = /<!-{2}([\s\S]*?)-->/g

export const characterDataSectionStartRegExp = /^<!\[CDATA\[/

export const cDataSectionRE = /<!\[CDATA\[([\s\S]*?)]]>/g
