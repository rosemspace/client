import { ErrorCodes } from '../error'
import Node from '../Node'
import {
  startsWithControlCharExcSpaceAndNullSeqRegExp,
  startsWithNonCharSeqRegExp,
  startsWithSurrogateCharSeqRegExp,
} from '../preprocess'
import Tokenizer, { TokenHooks, TokenParser, WithErrorHook } from '../Tokenizer'

const preprocessors: {
  regExp: RegExp
  code: ErrorCodes
  message: string
}[] = [
  {
    regExp: startsWithSurrogateCharSeqRegExp,
    code: ErrorCodes.SURROGATE_IN_INPUT_STREAM,
    message: 'Non-character in input stream',
  },
  {
    regExp: startsWithNonCharSeqRegExp,
    code: ErrorCodes.NONCHARACTER_IN_INPUT_STREAM,
    message: 'Surrogate in input stream',
  },
  {
    regExp: startsWithControlCharExcSpaceAndNullSeqRegExp,
    code: ErrorCodes.CONTROL_CHARACTER_IN_INPUT_STREAM,
    message: 'Control character in input stream',
  },
]

export default abstract class MarkupParser<T extends Node, U extends TokenHooks>
  implements TokenParser<T, U> {
  protected hooks?: WithErrorHook<U>

  protected constructor(hooks?: WithErrorHook<U>) {
    this.hooks = hooks
  }

  abstract test(source: string): boolean

  parse(source: string, tokenizer: Tokenizer<U>): void | T {
    for (let index = 0; index < preprocessors.length; ++index) {
      const preprocessor = preprocessors[index]
      const match: RegExpExecArray | null = preprocessor.regExp.exec(
        tokenizer.remainingSource
      )

      if (match === null) {
        continue
      }

      tokenizer.error({
        code: preprocessor.code,
        message: preprocessor.message,
        __starts: tokenizer.cursorPosition,
        __ends: tokenizer.advance(match.index),
      })
      index = 0
    }
  }
}
