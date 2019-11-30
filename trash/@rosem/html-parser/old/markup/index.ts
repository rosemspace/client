import {
  cDataSectionStartRegExp,
  commentStartRegExp,
  declarationStartRegExp,
  endTagRegExp,
  processingInstructionStartRegExp,
  startTagOpenRegExp,
} from '@rosemlabs/xml-util'
import { conditionalCommentStartRegExp } from '@rosemlabs/html-util'
import HookList from '../HookList'
import Tokenizer from '../Tokenizer'
import Node from '../Node'

export { default as StartTagParser } from './StartTagParser'
export { default as EndTagParser } from './EndTagParser'
export { default as TextParser } from './TextParser'

export interface TokenIdentifier {
  test(source: string): boolean
  // exec(source: string): string[] | null
}

// export interface TokenAnalyzer<T extends Node> {
//   analyze(tokenChunks: string[], state: State): T | void
// }

export interface TokenParser<T extends Node>
  extends TokenIdentifier {
  parse(source: string, state?: Tokenizer): T | void
}

export interface FractionParser<T extends Node> {
  (source: string, hooks: HookList, state: Tokenizer): T | void
}

// export interface TokenParser<T extends Node> {
//   (tokenMatch: RegExpMatchArray, hooks: HookList, state: State): T | void
// }

export type TokenMatcher = (source: string) => RegExpMatchArray | null

export const createTokenMatcher: (regExp: RegExp) => TokenMatcher = (
  regExp: RegExp
): TokenMatcher => (source: string) => source.match(regExp)

export function createFractionParser<T extends Node>(
  tokenMatcherRegExp: RegExp,
  tokenParser: TokenParser<T>
): FractionParser<T> {
  const tokenMatcher: TokenMatcher = createTokenMatcher(tokenMatcherRegExp)

  return (
    source: string,
    hooks: HookList,
    state: Tokenizer = new Tokenizer(source)
  ): T | void => {
    const match: RegExpMatchArray | null = tokenMatcher(source)

    if (!match) {
      return
    }

    return tokenParser(match, hooks, state)
  }
}

export const XML_TOKEN_REGEXP_LIST: RegExp[] = [
  processingInstructionStartRegExp,
  declarationStartRegExp,
  commentStartRegExp,
  cDataSectionStartRegExp,
  endTagRegExp,
  startTagOpenRegExp,
]

export const HTML_TOKEN_REGEXP_LIST: RegExp[] = XML_TOKEN_REGEXP_LIST.concat([
  conditionalCommentStartRegExp,
])
