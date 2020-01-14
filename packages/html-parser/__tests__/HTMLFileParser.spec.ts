// import { readFileSync } from 'fs'
// import { join } from 'path'
import { ErrorCode } from '../errors'
import { parseError } from '../__mocks__/htmlParser'

describe('parseFromString', () => {
  describe('Start tag', () => {
    it('Surrogate in input stream', () => {
      for (
        let charCode = '\uD800'.charCodeAt(0);
        charCode <= '\uDFFF'.charCodeAt(0);
        ++charCode
      ) {
        const char = String.fromCharCode(charCode)

        expect(parseError(char)).toEqual(ErrorCode.SURROGATE_IN_INPUT_STREAM)
        // expect(parseError(`<${char}end`)).toEqual(
        //   ErrorCode.SURROGATE_IN_INPUT_STREAM
        // )
        // expect(parseError(`<start${char}`)).toEqual(
        //   ErrorCode.SURROGATE_IN_INPUT_STREAM
        // )
      }
      // expect(parseError('<!-->')).toEqual(
      //   ParseErrorCode.ABRUPT_CLOSING_OF_EMPTY_COMMENT
      // )
      // expect(parseError('<!--->')).toEqual(
      //   ParseErrorCode.ABRUPT_CLOSING_OF_EMPTY_COMMENT
      // )
    })
  })
})
