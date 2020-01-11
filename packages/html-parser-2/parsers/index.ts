export enum TokenType {
  START_TAG_TOKEN,
  END_TAG_TOKEN,
  COMMENT_TOKEN,
  CDATA_SECTION_TOKEN,
  DOCTYPE_TOKEN,
  TEXT_TOKEN,
  EOF_TOKEN,
}

export { default as StartTagParser } from './StartTagParser'
export * from './StartTagParser'
export { default as EndTagParser } from './EndTagParser'
export * from './EndTagParser'
export { default as TextParser } from './TextParser'
export * from './TextParser'
