// import { readFileSync } from 'fs'
// import { join } from 'path'
import { ErrorCode } from '../errors'
import { parseError } from '../__mocks__/htmlParser'

describe('parseFromString', () => {
  describe('Start tag', () => {
    it('Surrogate in input stream', () => {
      // 55296, 55978, 56320, 57343
      const surrogateInput = `\uDFFFa\uDC00\uDAAAbc\uD800`

      expect(parseError(surrogateInput)).toEqual([
        ErrorCode.SURROGATE_IN_INPUT_STREAM,
        ErrorCode.SURROGATE_IN_INPUT_STREAM,
        ErrorCode.SURROGATE_IN_INPUT_STREAM,
      ])
      // expect(parseError(`<${char}end`)).toEqual(
      //   ErrorCode.SURROGATE_IN_INPUT_STREAM
      // )
      // expect(parseError(`<start${char}`)).toEqual(
      //   ErrorCode.SURROGATE_IN_INPUT_STREAM
      // )
      // expect(parseError('<!-->')).toEqual(
      //   ParseErrorCode.ABRUPT_CLOSING_OF_EMPTY_COMMENT
      // )
      // expect(parseError('<!--->')).toEqual(
      //   ParseErrorCode.ABRUPT_CLOSING_OF_EMPTY_COMMENT
      // )
    })
  })
})
