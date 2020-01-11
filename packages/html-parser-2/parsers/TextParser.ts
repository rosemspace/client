import { NodeName, NodeType } from '@rosemlabs/dom-api'
import { endTagRegExp, startTagOpenRegExp } from '@rosemlabs/xml-util'
import { VText } from '../ast'
import { ErrorCode } from '../errors'
import preprocess from '../preprocess'
import { TokenIdentifier, TokenParser } from '../Token'
import Tokenizer, { CommonEventMap, Module } from '../Tokenizer'

export type TextParserEventMap = {
  whitespaceSequence: VText
  characterSequence: VText
  characterReference: VText
  text: VText
} & CommonEventMap

export enum TextMode {
  // <title>, <textarea>
  RCDATA,
  // <style>, <xmp>, <iframe>, <noembed>, <noframes>
  // [<noscript> (if scripting flag is enabled)]
  RAWTEXT,
  // <script>
  SCRIPT_DATA,
  // <plaintext> (deprecated)
  PLAINTEXT,
  // all other elements
  // [<noscript> (if scripting flag is disabled)]
  DATA,
  // in foreign elements
  CDATA,
}

export enum CharType {
  SURROGATE,
  NONCHARACTER,
  CONTROL,
  NULL,
  WHITESPACE,
  CHARACTER,
  REFERENCE,
}

// OPTIMIZATION: specification uses only one type of character tokens (one token
// per character). This causes a huge memory overhead and a lot of unnecessary
// parser loops. We use 3 groups of characters. If we have a sequence of
// characters that belong to the same group, parser can process it as a single
// solid character token. So, there are 3 types of character tokens:
// 1) NULL_CHARACTER_TOKEN - \u0000-character sequences
// (e.g. '\u0000\u0000\u0000')
// 2) WHITESPACE_CHARACTER_TOKEN - any whitespace/new-line character sequences
// (e.g. '\n  \r\t   \f')
// 3) CHARACTER_TOKEN - any character sequence which don't belong to groups 1
// and 2 (e.g. 'abcdef1234@@#$%^')
export default class TextParser implements TokenParser<TextParserEventMap> {
  private nonTextTokenIdentifiers: TokenIdentifier[]

  constructor(
    nonTextTokenIdentifiers: TokenIdentifier[] = [
      // todo: add all identifiers
      endTagRegExp,
      startTagOpenRegExp,
    ]
  ) {
    this.nonTextTokenIdentifiers = nonTextTokenIdentifiers
  }

  test(source: string): boolean {
    return Boolean(source)
  }

  parse(
    source: string,
    hooks?: Module<TextParserEventMap>,
    tokenizer: Tokenizer<TextParserEventMap> = new Tokenizer([], hooks, source)
  ): VText | void {
    preprocess(
      tokenizer.remainingSource,
      (code: ErrorCode, offset: number): void => {
        tokenizer.emit(
          'error',
          tokenizer.error(code, {
            __starts: tokenizer.cursorPosition,
            __ends: tokenizer.consume(offset),
          })
        )
      }
    )

    let textEndTokenIndex: number = source.indexOf('<')
    let data: string | undefined

    if (textEndTokenIndex >= 0) {
      let rest = source.slice(textEndTokenIndex)
      let ignoreCharIndex

      // Do not treat character "<" in plain text as a parser instruction
      while (
        // !state.isMarkedUp(rest) &&
        !this.nonTextTokenIdentifiers.some(
          (tokenIdentifier: TokenIdentifier): boolean =>
            tokenIdentifier.test(rest)
        ) &&
        (ignoreCharIndex = rest.indexOf('<', 1)) >= 0
      ) {
        textEndTokenIndex += ignoreCharIndex
        rest = source.slice(textEndTokenIndex)
      }

      data = source.slice(0, textEndTokenIndex)
    } else {
      data = source
    }

    // // todo: do we need this?
    // if (!data && !textEndTokenIndex) {
    //   data = source
    // }

    // Ensure we don't have an empty string
    if (!data) {
      return
    }

    const text: VText = {
      nodeType: NodeType.TEXT_NODE,
      nodeName: NodeName.TEXT_NODE,
      data,
      raw: false,
      __starts: tokenizer.cursorPosition,
      __ends: tokenizer.cursorPosition + data.length,
    }

    tokenizer.consume(data.length)
    tokenizer.emit('text', text)

    return text
  }

  addNonTextTokenIdentifier(nonTextTokenIdentifier: TokenIdentifier): void {
    this.nonTextTokenIdentifiers.push(nonTextTokenIdentifier)
  }
}
