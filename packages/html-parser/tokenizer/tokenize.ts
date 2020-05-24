import createTokenTree from './createTokenTree'
import scheme from './htmlScheme'
import Token, { TokenMatcher, TokenNode } from './token'

export function* tokenizeWithTree(
  data: { source: string },
  tokenTree: TokenNode[]
): Generator<Token> {
  // if (!data.source.length) {
  //   return
  // }

  for (let i = 0; i < tokenTree.length; ++i) {
    const token = tokenTree[i].pattern.exec(data.source)

    if (!token) {
      continue
    }

    yield [tokenTree[i].event, token[0], token[1] || token[2] || token[3]]

    data.source = data.source.slice(token[0].length)

    if (tokenTree[i].children.length) {
      yield* tokenizeWithTree(data, tokenTree[i].children)
    }

    if (tokenTree[i].repeat) {
      --i
    } else if (tokenTree[i].loop) {
      i = -1
    }
  }
}

export default function tokenize(
  source: string,
  tokenScheme: TokenMatcher[] = scheme
): Generator<Token> {
  return tokenizeWithTree({ source }, createTokenTree(tokenScheme))
}
