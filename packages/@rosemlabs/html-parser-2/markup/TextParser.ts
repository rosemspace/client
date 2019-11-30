import { NodeName, NodeType } from '@rosemlabs/dom-api'
import { endTagRegExp, startTagOpenRegExp } from '@rosemlabs/xml-util'
import {
  Text,
  TokenHook,
  TokenIdentifier,
  Tokenizer,
  WithErrorHook,
} from '../index'
import MarkupParser from './MarkupParser'

export type TextParserHooks = Partial<{
  onText: TokenHook<Text>
}>

export type TextParserEventMap = {
  text: Text
}

export default class TextParser extends MarkupParser<Text, TextParserHooks> {
  private nonTextTokenIdentifiers: TokenIdentifier[]

  constructor(
    hooks?: WithErrorHook<TextParserHooks>,
    nonTextTokenIdentifiers: TokenIdentifier[] = [
      // todo: add all identifiers
      endTagRegExp,
      startTagOpenRegExp,
    ]
  ) {
    super(hooks)
    this.nonTextTokenIdentifiers = nonTextTokenIdentifiers
  }

  test(source: string): boolean {
    return Boolean(source)
  }

  parse(
    source: string,
    tokenizer: Tokenizer<TextParserHooks> = new Tokenizer(
      [],
      this.hooks ? [this.hooks] : [],
      source
    )
  ): void | Text {
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

    const text: Text = {
      nodeType: NodeType.TEXT_NODE,
      nodeName: NodeName.TEXT_NODE,
      data,
      raw: false,
      __starts: tokenizer.cursorPosition,
      __ends: tokenizer.cursorPosition + data.length,
    }

    tokenizer.advance(data.length)
    tokenizer.emit('onText', text)

    return text
  }

  addNonTextTokenIdentifier(nonTextTokenIdentifier: TokenIdentifier): void {
    this.nonTextTokenIdentifiers.push(nonTextTokenIdentifier)
  }
}
