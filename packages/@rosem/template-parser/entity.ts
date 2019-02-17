export const TAB_ENTITY_DECIMAL_NUMBER = '&#9;'
export const TAB_ENTITY_HEX_NUMBER = '&#x00009;'
export const TAB_ENTITY_ALIAS_1 = '&Tab;'
export const NEW_LINE_ENTITY_DECIMAL_NUMBER = '&#10;'
export const NEW_LINE_ENTITY_HEX_NUMBER = '&#x00009;'
export const NEW_LINE_ENTITY_ALIAS_1 = '&NewLine;'
export const QUOTE_ENTITY_DECIMAL_NUMBER = '&#34;'
export const QUOTE_ENTITY_HEX_NUMBER = '&#x00022;'
export const QUOTE_ENTITY_ALIAS_1 = '&quot;'
export const QUOTE_ENTITY_ALIAS_2 = '&QUOT;'
export const AMPERSAND_ENTITY_DECIMAL_NUMBER = '&#38;'
export const AMPERSAND_ENTITY_HEX_NUMBER = '&#x00026;'
export const AMPERSAND_ENTITY_ALIAS_1 = '&amp;'
export const AMPERSAND_ENTITY_ALIAS_2 = '&AMP;'
export const APOSTROPHE_ENTITY_DECIMAL_NUMBER = '&#39;'
export const APOSTROPHE_ENTITY_HEX_NUMBER = '&#x00027;'
export const APOSTROPHE_ENTITY_ALIAS_1 = '&apos;'
export const LESS_THAN_ENTITY_DECIMAL_NUMBER = '&#60;'
export const LESS_THAN_ENTITY_HEX_NUMBER = '&#x0003C;'
export const LESS_THAN_ENTITY_ALIAS_1 = '&lt;'
export const LESS_THAN_ENTITY_ALIAS_2 = '&LT;'
export const GREATER_THAN_ENTITY_DECIMAL_NUMBER = '&#62;'
export const GREATER_THAN_ENTITY_HEX_NUMBER = '&#x0003E;'
export const GREATER_THAN_ENTITY_ALIAS_1 = '&gt;'
export const GREATER_THAN_ENTITY_ALIAS_2 = '&GT;'

const decodingMap: { [code: string]: string } = {
  [TAB_ENTITY_DECIMAL_NUMBER]: '\t',
  [TAB_ENTITY_HEX_NUMBER]: '\t',
  [TAB_ENTITY_ALIAS_1]: '\t',
  [NEW_LINE_ENTITY_DECIMAL_NUMBER]: '\n',
  [NEW_LINE_ENTITY_HEX_NUMBER]: '\n',
  [NEW_LINE_ENTITY_ALIAS_1]: '\n',
  [QUOTE_ENTITY_DECIMAL_NUMBER]: '"',
  [QUOTE_ENTITY_HEX_NUMBER]: '"',
  [QUOTE_ENTITY_ALIAS_1]: '"',
  [QUOTE_ENTITY_ALIAS_2]: '"',
  [AMPERSAND_ENTITY_DECIMAL_NUMBER]: '&',
  [AMPERSAND_ENTITY_HEX_NUMBER]: '&',
  [AMPERSAND_ENTITY_ALIAS_1]: '&',
  [AMPERSAND_ENTITY_ALIAS_2]: '&',
  [APOSTROPHE_ENTITY_DECIMAL_NUMBER]: "'",
  [APOSTROPHE_ENTITY_HEX_NUMBER]: "'",
  [APOSTROPHE_ENTITY_ALIAS_1]: "'",
  [LESS_THAN_ENTITY_DECIMAL_NUMBER]: '<',
  [LESS_THAN_ENTITY_HEX_NUMBER]: '<',
  [LESS_THAN_ENTITY_ALIAS_1]: '<',
  [LESS_THAN_ENTITY_ALIAS_2]: '<',
  [GREATER_THAN_ENTITY_DECIMAL_NUMBER]: '>',
  [GREATER_THAN_ENTITY_HEX_NUMBER]: '>',
  [GREATER_THAN_ENTITY_ALIAS_1]: '>',
  [GREATER_THAN_ENTITY_ALIAS_2]: '>',
}
const encodedAttrCommonAliasREPart = 'a(?:pos|mp)|AMP|(?:[lg]|quo)?t|(?:[LG]|QUO)?T'
const encodedAttrRE = new RegExp(
  `^&(?:${encodedAttrCommonAliasREPart}|#(?:3[489]|6[02]));$`,
  'g'
)
const encodedAttrNewLineRE = new RegExp(
  `^&(?:${encodedAttrCommonAliasREPart}|NewLine|Tab|#(?:9|10|3[489]|6[02]));$`,
  'g'
)

export function decodeAttrEntities(
  value: string,
  shouldDecodeNewlines: boolean = false
): string {
  return value.replace(
    shouldDecodeNewlines ? encodedAttrNewLineRE : encodedAttrRE,
    (match) => decodingMap[match]
  )
}
