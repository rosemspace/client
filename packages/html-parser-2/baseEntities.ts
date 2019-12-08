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
  [apostropheChar]: '&apos;',
  [greaterThanChar]: '&gt;',
  [lessThanChar]: '&lt;',
  [quoteChar]: '&quot;',
}

export const BASE_ENTITY_DECODING_MAP: BaseEntityMap = {
  '&amp;': ampersandChar,
  '&AMP;': ampersandChar,
  '&apos;': apostropheChar,
  '&lt;': lessThanChar,
  '&LT;': lessThanChar,
  '&gt;': greaterThanChar,
  '&GT;': greaterThanChar,
  '&quot;': quoteChar,
  '&QUOT;': quoteChar,
  // Google Chrome encodes tabs and new lines in a[href].
  '&#9;': tabChar,
  '&Tab;': tabChar,
  // Internet Explorer encodes newlines inside attribute values.
  '&#10;': newLineChar,
  '&NewLine;': newLineChar,
}

const decodedBaseEntityRegExp: RegExp = new RegExp(
  `[${ampersandChar}${apostropheChar}${greaterThanChar}${lessThanChar}${quoteChar}]`,
  'g'
)

const encodedSpecialCharRegExp: RegExp = /^&(?:a(?:pos|mp)|AMP|(?:[lg]|quo)?t|(?:[LG]|QUO)?T|NewLine|Tab|#(?:9|10|3[489]|6[02]));$/g

export function encodeBaseEntities(value: string): string {
  return String(value).replace(
    decodedBaseEntityRegExp,
    (match: string): string => BASE_ENTITY_ENCODING_MAP[match]
  )
}

export function decodeBaseEntities(value: string): string {
  return String(value).replace(
    encodedSpecialCharRegExp,
    (match: string): string => BASE_ENTITY_DECODING_MAP[match]
  )
}
