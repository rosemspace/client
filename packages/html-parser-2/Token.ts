import { ErrorCode } from './errors'
import { EventMap } from './EventEmitter'
import Tokenizer, { CommonEventMap, Module, HookMap } from './Tokenizer'

export type SourceCodeRange = {
  __starts: number
  __ends: number
}

type Token = SourceCodeRange

export default Token

export interface TokenIdentifier {
  test(source: string): boolean
}

export interface TokenParser<
  T extends CommonEventMap<U> & EventMap,
  U extends ErrorCode = ErrorCode
> extends TokenIdentifier {
  parse(
    source: string,
    hooks?: HookMap<T> | Module<T, U>,
    tokenizer?: Tokenizer<T, U>
  ): Token | void
}
