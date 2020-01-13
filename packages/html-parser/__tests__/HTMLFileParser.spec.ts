// import { readFileSync } from 'fs'
// import { join } from 'path'
// import { NodeType } from '@rosemlabs/dom-api'
// import { ErrorCode } from '../errors'
// import { parse, parseError } from '../__mocks__/htmlParser'
//
// describe('parseFromString', () => {
//   describe('Start tag', () => {
//     it('Surrogate in input stream', () => {
//       for (let charCode = '\uD800'.charCodeAt(0); charCode <= '\uDFFF'.charCodeAt(0); ++charCode) {
//         expect(parseError(String.fromCharCode(charCode))).toEqual(
//           ErrorCode.SURROGATE_IN_INPUT_STREAM
//         )
//       }
//       // expect(parseError('<!-->')).toEqual(
//       //   ParseErrorCode.ABRUPT_CLOSING_OF_EMPTY_COMMENT
//       // )
//       // expect(parseError('<!--->')).toEqual(
//       //   ParseErrorCode.ABRUPT_CLOSING_OF_EMPTY_COMMENT
//       // )
//     })
//   })
// })
