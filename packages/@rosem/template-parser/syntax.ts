import unicodeLetters from './unicodeLetters'

export const doctypeRE = /^<!DOCTYPE [^>]+>/i

// Non-colonized name e.g. "name"
// could use CombiningChar and Extender characters
// (https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName)
// but for ui templates we can enforce a simple charset
const ncNameREPart = `[a-zA-Z_][\\-\\.0-9_${unicodeLetters}]*`

// Qualified name e.g. "namespace:name"
const qNameRECapture = `((?:${ncNameREPart}\\:)?${ncNameREPart})`

export const startTagOpenRE = new RegExp(`^<${qNameRECapture}`)

export const startTagCloseRE = /^\s*(\/?)>/

// Regular Expressions for parsing tags and attributes
export const attributeRE = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

export const endTagRE = new RegExp(`^<\\/${qNameRECapture}[^>]*>`)

// Used repeating construction to avoid being passed as HTML comment when inlined in a page
export const commentStartRE = /^<!-{2}/

export const conditionalCommentStartRE = /^<!\[/

export const commentRE = /<!-{2}([\s\S]*?)-->/g

export const conditionalCommentRE = /<!\[CDATA\[([\s\S]*?)]]>/g

// Special Elements (can contain anything)
export const plainTextElementRE = /s(?:cript|tyle)|textarea/i

export const COMMENT_END_TOKEN = '-->'

export const CONDITIONAL_COMMENT_END_TOKEN = ']>'

export const COMMENT_START_TOKEN_LENGTH = 4 // <!--

export const COMMENT_END_TOKEN_LENGTH = 3 // -->

export const CONDITIONAL_COMMENT_END_TOKEN_LENGTH = 2 // ]>
