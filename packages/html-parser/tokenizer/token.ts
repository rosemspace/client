type Token = [string, string, string]

export default Token

export enum TokenType {
  EOF,
  START_TAG_NAME,
  ATTRIBUTE_NAME,
  ATTRIBUTE_VALUE,
  START_TAG_END,
}

export type TokenMatcher = {
  scope?: string[]
  name: string
  pattern: RegExp
  repeat?: boolean
  loop?: boolean
  composite?: boolean
}

export type TokenNode = TokenMatcher & {
  event: string
  children: TokenNode[]
}
