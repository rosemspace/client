import { ErrorCode } from '../errors'
import { EventMap } from '../EventEmitter'
import Token from '../Token'
import Tokenizer, { CommonEventMap, HookMap, Module } from '../Tokenizer'

export interface TokenIdentifier {
  test(source: string): boolean
}

export default abstract class TokenParser<
  T extends CommonEventMap<U> & EventMap,
  U extends ErrorCode = ErrorCode
> implements TokenIdentifier {
  protected abstract readonly startDelimiter: string

  test(source: string): boolean {
    return source.startsWith(this.startDelimiter)
  }

  abstract parse(
    source: string,
    hooks?: HookMap<T> | Module<T, U>,
    tokenizer?: Tokenizer<T, U>
  ): Token | void
}
