const tabChar = '\t'
const newLineChar = '\n'
const quoteChar = '"'
const ampersandChar = '&'
const apostropheChar = "'"
const lessThanChar = '<'
const greaterThanChar = '>'

type DecodeAttrEntities = { [code: string]: string }

// https://www.w3.org/TR/REC-xml/#sec-predefined-ent
export const ATTRIBUTE_ENTITY_DECODING_MAP: DecodeAttrEntities = {
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

const encodedAttrCommonAliasRegExpPart =
  'a(?:pos|mp)|AMP|(?:[lg]|quo)?t|(?:[LG]|QUO)?T'
const encodedAttrRE = new RegExp(
  `^&(?:${encodedAttrCommonAliasRegExpPart}|#(?:3[489]|6[02]));$`,
  'g'
)
const encodedAttrNewLineRE = new RegExp(
  `^&(?:${encodedAttrCommonAliasRegExpPart}|NewLine|Tab|#(?:9|10|3[489]|6[02]));$`,
  'g'
)

export default function decodeAttrEntities(
  value: string,
  shouldDecodeNewlines: boolean = false
): string {
  return value.replace(
    shouldDecodeNewlines ? encodedAttrNewLineRE : encodedAttrRE,
    (match) => ATTRIBUTE_ENTITY_DECODING_MAP[match]
  )
}
