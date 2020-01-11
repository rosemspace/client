// https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream

import {
  startsWithControlCharExcSpaceAndNullSeqRegExp,
  startsWithNonCharSeqRegExp,
  startsWithSurrogateSeqRegExp,
} from './codePoints'
import { ErrorCode } from './errors'

export function normalizeNewLines(source: string): string {
  return source.replace(/\r\n?/, `\n`)
}

const preprocessors: [RegExp, ErrorCode][] = [
  [startsWithSurrogateSeqRegExp, ErrorCode.SURROGATE_IN_INPUT_STREAM],
  [startsWithNonCharSeqRegExp, ErrorCode.NONCHARACTER_IN_INPUT_STREAM],
  [
    startsWithControlCharExcSpaceAndNullSeqRegExp,
    ErrorCode.CONTROL_CHARACTER_IN_INPUT_STREAM,
  ],
]

export default function preprocess(
  source: string,
  error: (code: ErrorCode, offset: number) => void
): void {
  for (let index = 0; index < preprocessors.length; ++index) {
    const [regExp, code] = preprocessors[index]
    const match: RegExpExecArray | null = regExp.exec(source)

    if (match === null) {
      continue
    }

    error(code, match.index)
    index = 0
  }
}
