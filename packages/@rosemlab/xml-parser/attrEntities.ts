const ampersandChar = '&'
const apostropheChar = "'"
const greaterThanChar = '>'
const lessThanChar = '<'
const newLineChar = '\n'
const quoteChar = '"'
const tabChar = '\t'

type AttrEntities = { [codeOrChar: string]: string }

// https://www.w3.org/TR/REC-xml/#sec-predefined-ent
export const ATTRIBUTE_ENTITY_ENCODING_MAP: AttrEntities = {
  [ampersandChar]: '&amp;',
  [apostropheChar]: '&apos;',
  [greaterThanChar]: '&gt;',
  [lessThanChar]: '&lt;',
  [newLineChar]: '&#10;',
  [quoteChar]: '&quot;',
  [tabChar]: '&#9;',
}

export const ATTRIBUTE_ENTITY_DECODING_MAP: AttrEntities = {
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

const decodedAttrCommonRegExpPart: string = `${ampersandChar}${apostropheChar}${greaterThanChar}${lessThanChar}${quoteChar}`
const decodedAttrRegExp: RegExp = new RegExp(
  `[${decodedAttrCommonRegExpPart}]`,
  'g'
)
const decodedAttrWithTabAndNewLineRegExp: RegExp = new RegExp(
  `[${decodedAttrCommonRegExpPart}${newLineChar}${tabChar}]`,
  'g'
)
const encodedAttrCommonAliasRegExpPart: string =
  'a(?:pos|mp)|AMP|(?:[lg]|quo)?t|(?:[LG]|QUO)?T'
const encodedAttrRegExp: RegExp = new RegExp(
  `^&(?:${encodedAttrCommonAliasRegExpPart}|#(?:3[489]|6[02]));$`,
  'g'
)
const encodedAttrWithTabAndNewLineRegExp: RegExp = new RegExp(
  `^&(?:${encodedAttrCommonAliasRegExpPart}|NewLine|Tab|#(?:9|10|3[489]|6[02]));$`,
  'g'
)

export function encodeAttrEntities(
  value: string,
  shouldDecodeTabsAndNewlines: boolean = false
): string {
  return value.replace(
    shouldDecodeTabsAndNewlines
      ? decodedAttrWithTabAndNewLineRegExp
      : decodedAttrRegExp,
    (match: string): string => ATTRIBUTE_ENTITY_ENCODING_MAP[match]
  )
}

export function decodeAttrEntities(
  value: string,
  shouldDecodeTabsAndNewlines: boolean = false
): string {
  return value.replace(
    shouldDecodeTabsAndNewlines
      ? encodedAttrWithTabAndNewLineRegExp
      : encodedAttrRegExp,
    (match: string): string => ATTRIBUTE_ENTITY_DECODING_MAP[match]
  )
}
