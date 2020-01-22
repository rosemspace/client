import { ErrorCode } from '../errors'
import { EventMap } from '../EventEmitter'
import Token from '../Token'
import Tokenizer, { CommonEventMap, HookMap, Module } from '../Tokenizer'

export interface TokenIdentifierExecArray extends Array<string> {
  index: number
}

export interface TokenIdentifier {
  exec(source: string): TokenIdentifierExecArray | null
}

export default interface TokenParser<
  T extends CommonEventMap<U> & EventMap,
  U extends ErrorCode = ErrorCode
> extends TokenIdentifier {
  parse(
    source: string,
    hooks?: HookMap<T> | Module<T, U>,
    tokenizer?: Tokenizer<T, U>
  ): Token | void
}
