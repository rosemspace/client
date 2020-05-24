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

  // https://html.spec.whatwg.org/multipage/parsing.html#tokenization
  describe('DATA state', () => {
    // data -> processing instruction -> start tag -> attributes
    const test = [
      // 1. 3 char tokens `txt`
      // 2. end-of-file token
      `txt`,
      // 1. invalid-first-character-of-tag-name parse error
      // 2. 2 char tokens `<:`
      // 3. invalid-first-character-of-tag-name parse error
      // 4. 2 char tokens `<0`
      // 5. eof-before-tag-name parse error
      // 6. char token `<`
      // 7. end-of-file token
      `<:<0<`,
      // 1. comment token `<?`
      // 2. unexpected-null-character parse error
      // 3. char token `�`
      // 4. end-of-file token
      `<?<?\u0000`,
      // 1. comment token ``
      // 2. comment token `&`
      // 3. unexpected-null-character parse error
      // 4. tag token `ta�:<`
      // 5. eof-in-tag parse error
      // 6. end-of-file token
      `<?><?&><Ta\u0000:<><tA`,
      // 1. self-closing tag token `x`
      // 2. unexpected-solidus-in-tag parse error
      // 3. eof-in-tag parse error
      // 4. end-of-file token
      `<x/><X\n\n\t//`,
      // 1. unexpected-solidus-in-tag parse error
      // 2. unexpected-solidus-in-tag parse error
      // 3. self-closing tag token `x&x`
      // 4. 4 char tokens `/X&X`
      // 5. unexpected-equals-sign-before-attribute-name parse error
      // 6. eof-in-tag parse error
      // 7. end-of-file token
      `<X&X / // >/X&X<X&X= =`,
      // 1. unexpected-equals-sign-before-attribute-name parse error
      // 2. tag token `f#` with attribute `=`=``
      // 3. unexpected-equals-sign-before-attribute-name parse error
      // 4. missing-attribute-value parse error
      // 5. tag token `f=` with attribute `=`=``
      // 6. unexpected-equals-sign-before-attribute-name parse error
      // 7. unexpected-character-in-unquoted-attribute-value parse error
      // todo same attribute name used
      // 8. tag token `f` with attribute `=`=`=`
      // 9. unexpected-character-in-attribute-name parse error
      // 10. unexpected-character-in-unquoted-attribute-value parse error
      // 11. tag token `f#` with attribute `=`=`==`
      `<f# =><f= == ><f == = ====><f# <===>`,
      // 1. unexpected-character-in-attribute-name parse error
      // 2. missing-attribute-value parse error
      // 3. tag token `foo` with attribute `"`=``
      // 4. unexpected-character-in-attribute-name parse error
      // 5. unexpected-character-in-unquoted-attribute-value parse error
      // 6. unexpected-null-character parse error
      // 7. tag token `foo` with attribute `'`=`"�`
      // 8. unexpected-null-character parse error
      // 9. eof-in-tag parse error
      // 10. end-of-file token
      `<Foo "=><fOO '="\u0000><fOo \u0000='\`>`,
      // 1. unexpected-character-in-unquoted-attribute-value parse error
      // 2. tag token `foo` with attribute `foo`=`\``
      // 3. missing-whitespace-between-attributes parse error
      // todo same attribute name used
      // 4. tag token `foo` with attributes `foo`=`` and `'`=``
      // 6. unexpected-null-character parse error
      // 5. tag token `foo` with attribute `foo`=`</FOO>�`
      `<foO\tFoO=\` ><FoO\nfoO=''' FOO='"'\f><FOO foo=\t "</FOO>\u0000">`,
      //
      `txt\u0000< &todo;`,
    ]

    // var DATA_STATE = {
    //   // Set the `return state` to the `data state`
    //   '&': CHARACTER_REFERENCE_STATE,
    //   '<': {},
    //   '\u0000': {},
    //   EOF: {},
    //   else: 'CHARACTER_TOKEN',
    // }
    // // Set the `temporary buffer` to the empty string.
    // // Append a U+0026 AMPERSAND (&) character to the `temporary buffer`
    // var CHARACTER_REFERENCE_STATE = {}
  })
})
