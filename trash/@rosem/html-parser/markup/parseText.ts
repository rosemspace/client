import { NodeName, NodeType } from '@rosemlabs/dom-api'
import { FractionParser, HTML_TOKEN_REGEXP_LIST } from './index'
import Tokenizer from '@rosemlabs/html-parser/Tokenizer'
import HookList from '../HookList'
import { Text } from '../node'

const parseText: FractionParser<Text> = (
  source: string,
  hooks: HookList = {},
  state: Tokenizer = new Tokenizer(source, HTML_TOKEN_REGEXP_LIST)
): Text | void => {
  let textEndTokenIndex: number = source.indexOf('<')
  let data: string | undefined

  if (textEndTokenIndex >= 0) {
    let rest = source.slice(textEndTokenIndex)
    let ignoreCharIndex

    // Do not treat character "<" in plain text as a parser instruction
    while (
      !state.isMarkedUp(rest) &&
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
    __starts: state.cursorPosition,
    __ends: state.cursorPosition + data.length,
  }

  state.advance(data.length)
  hooks.text && hooks.text(text, state)

  return text
}

export default parseText
