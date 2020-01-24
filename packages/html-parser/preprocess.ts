// https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream

import {
  startsWithControlCharExcSpaceAndNullRegExp,
  startsWithNonCharRegExp,
  startsWithSurrogateSeqRegExp,
} from './utils/infra/codePoints'
import { ErrorCode } from './errors'

const preprocessors: [RegExp, ErrorCode][] = [
  [startsWithSurrogateSeqRegExp, ErrorCode.SURROGATE_IN_INPUT_STREAM],
  [startsWithNonCharRegExp, ErrorCode.NONCHARACTER_IN_INPUT_STREAM],
  [
    startsWithControlCharExcSpaceAndNullRegExp,
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

    error(code, match.index + match[0].length)
    index = 0
  }
}
