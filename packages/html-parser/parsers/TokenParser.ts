import { ErrorCode } from '../errors'
import { EventMap } from '../EventEmitter'
import Tokenizer, { CommonEventMap, HookMap, Module } from '../Tokenizer'
import Token from '../Token'

export interface TokenIdentifier {
  readonly pattern: RegExp
}

export default interface TokenParser<
  T extends CommonEventMap<U> & EventMap,
  U extends ErrorCode = ErrorCode
> extends TokenIdentifier {
  // Get lexemes
  // analyze(source: string): string[] | null
  // tokenize(match: string[]): Token | void
  parse(
    source: string,
    hooks?: HookMap<T> | Module<T, U>,
    tokenizer?: Tokenizer<T, U>
  ): Token | void
}
