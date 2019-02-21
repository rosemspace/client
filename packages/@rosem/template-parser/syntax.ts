import unicodeLetters from './unicodeLetters'

export const processingInstructionRE = /^\s*<\?[^>]+\?>/

export const xmlDeclarationRE = /^\s*<\?xml[^>]+>/

export const doctypeDeclarationRE = /^\s*<!DOCTYPE [^>]+>/i

// Non-colonized name e.g. "name"
// could use CombiningChar and Extender characters
// (https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName)
// but for ui templates we can enforce a simple charset
const ncNameREPart = `[a-zA-Z_][\\-\\.0-9_${unicodeLetters}]*`

// Qualified name e.g. "namespace:name"
export const qNameRE = new RegExp(`^(?:(${ncNameREPart}):)?(${ncNameREPart})$`)

const qNameRECapturePart = `((?:${ncNameREPart}\\:)?${ncNameREPart})`

export const startTagOpenRE = new RegExp(`^<${qNameRECapturePart}`)

export const startTagCloseRE = /^\s*(\/?)>/

// Regular Expressions for parsing tags and attributes
export const attributeRE = /^\s*([^\s"'<>/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

export const endTagRE = new RegExp(`^<\\/${qNameRECapturePart}[^>]*>`)

// Used repeating construction to avoid being passed as HTML comment when inlined in a page
export const commentStartRE = /^<!-{2}/

export const conditionalCommentStartRE = /^<!\[/

export const commentRE = /<!-{2}([\s\S]*?)-->/g

export const conditionalCommentCharacterDataRE = /<!\[CDATA\[([\s\S]*?)]]>/g

export const COMMENT_END_TOKEN = '-->'

export const CONDITIONAL_COMMENT_END_TOKEN = ']>'

export const COMMENT_START_TOKEN_LENGTH = 4 // <!--

export const COMMENT_END_TOKEN_LENGTH = 3 // -->

export const CONDITIONAL_COMMENT_START_TOKEN_LENGTH = 3 // <![

export const CONDITIONAL_COMMENT_END_TOKEN_LENGTH = 2 // ]>
