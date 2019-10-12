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
  [newLineChar]: '&#10;',
  [quoteChar]: '&quot;',
  [tabChar]: '&#9;',
}

export const BASE_ENTITY_DECODING_MAP: BaseEntityMap = {
  '&#9;': tabChar,
  '&#x00009;': tabChar,
  '&Tab;': tabChar,
  '&#10;': newLineChar,
  '&#x0000A;': newLineChar,
  '&NewLine;': newLineChar,
  '&#34;': quoteChar,
  '&#x00022;': quoteChar,
  '&quot;': quoteChar,
  '&QUOT;': quoteChar,
  '&#38;': ampersandChar,
  '&#x00026;': ampersandChar,
  '&amp;': ampersandChar,
  '&AMP;': ampersandChar,
  '&#39;': apostropheChar,
  '&#x00027;': apostropheChar,
  '&apos;': apostropheChar,
  '&#60;': lessThanChar,
  '&#x0003C;': lessThanChar,
  '&lt;': lessThanChar,
  '&LT;': lessThanChar,
  '&#62;': greaterThanChar,
  '&#x0003E;': greaterThanChar,
  '&gt;': greaterThanChar,
  '&GT;': greaterThanChar,
}

const decodedBaseEntityCommonRegExpPart: string = `${ampersandChar}${apostropheChar}${greaterThanChar}${lessThanChar}${quoteChar}`
const decodedBaseEntityRegExp: RegExp = new RegExp(
  `[${decodedBaseEntityCommonRegExpPart}]`,
  'g'
)
const decodedBaseEntityAndTabAndNewLineRegExp: RegExp = new RegExp(
  `[${decodedBaseEntityCommonRegExpPart}${newLineChar}${tabChar}]`,
  'g'
)
const encodedSpecialCharCommonAliasRegExpPart: string =
  'a(?:pos|mp)|AMP|(?:[lg]|quo)?t|(?:[LG]|QUO)?T'
const encodedSpecialCharRegExp: RegExp = new RegExp(
  `^&(?:${encodedSpecialCharCommonAliasRegExpPart}|#(?:3[489]|6[02]));$`,
  'g'
)
const encodedSpecialCharAndTabAndNewLineRegExp: RegExp = new RegExp(
  `^&(?:${encodedSpecialCharCommonAliasRegExpPart}|NewLine|Tab|#(?:9|10|3[489]|6[02]));$`,
  'g'
)

export function encodeBaseEntities(
  value: string,
  shouldDecodeTabsAndNewlines: boolean = false
): string {
  return value.replace(
    shouldDecodeTabsAndNewlines
      ? decodedBaseEntityAndTabAndNewLineRegExp
      : decodedBaseEntityRegExp,
    (match: string): string => BASE_ENTITY_ENCODING_MAP[match]
  )
}

export function decodeBaseEntities(
  value: string,
  shouldDecodeTabsAndNewlines: boolean = false
): string {
  return value.replace(
    shouldDecodeTabsAndNewlines
      ? encodedSpecialCharAndTabAndNewLineRegExp
      : encodedSpecialCharRegExp,
    (match: string): string => BASE_ENTITY_DECODING_MAP[match]
  )
}
