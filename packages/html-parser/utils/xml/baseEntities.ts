const ampersandChar = '&'
const apostropheChar = "'"
const greaterThanChar = '>'
const lessThanChar = '<'
const newLineChar = '\n'
const quoteChar = '"'
const tabChar = '\t'

type BaseEntityMap = { [codeOrChar: string]: string }

// https://www.w3.org/TR/REC-xml/#sec-predefined-ent
export const BASE_ENTITY_ENCODING_MAP: BaseEntityMap = {
  [ampersandChar]: '&amp;',
  [apostropheChar]: '&#39;',
  [greaterThanChar]: '&gt;',
  [lessThanChar]: '&lt;',
  [quoteChar]: '&quot;',
}

export const BASE_ENTITY_DECODING_MAP: BaseEntityMap = {
  // Google Chrome encodes tabs and new lines in a[href].
  // Seems already fixed in newer version of Chrome
  '&#9;': tabChar,
  // Internet Explorer encodes newlines inside attribute values.
  // Edge ignores newlines in a[href] and replaces them by space character in
  // other attributes before first editing
  '&#10;': newLineChar,
  '&quot;': quoteChar,
  '&amp;': ampersandChar,
  '&#39;': apostropheChar,
  '&lt;': lessThanChar,
  '&gt;': greaterThanChar,
}

const decodedBaseEntityRegExp = new RegExp(
  `[${ampersandChar}${apostropheChar}${greaterThanChar}${lessThanChar}${quoteChar}]`,
  'g'
)
const encodedSpecialCharCommonAliasRegExpPart = 'amp|(?:[lg]|quo)t'
const encodedSpecialCharRegExp = new RegExp(
  `^&(?:${encodedSpecialCharCommonAliasRegExpPart}|#39);$`,
  'g'
)
const encodedSpecialCharAndTabAndNewLineRegExp = new RegExp(
  `^&(?:${encodedSpecialCharCommonAliasRegExpPart}|#(?:10|3?9));$`,
  'g'
)

export function encodeBaseEntities(value: string): string {
  return value.replace(
    decodedBaseEntityRegExp,
    (match: string): string => BASE_ENTITY_ENCODING_MAP[match]
  )
}

export function decodeBaseEntities(
  value: string,
  shouldDecodeTabsAndNewlines = false
): string {
  return value.replace(
    shouldDecodeTabsAndNewlines
      ? encodedSpecialCharAndTabAndNewLineRegExp
      : encodedSpecialCharRegExp,
    (match: string): string => BASE_ENTITY_DECODING_MAP[match]
  )
}
