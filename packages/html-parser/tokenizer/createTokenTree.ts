import { TokenMatcher, TokenNode } from './token'

function setByPath(
  tree: TokenNode[],
  path: string[],
  value: TokenNode,
  index = 0
): void {
  const node = tree.find((node) => node.name === path[index])

  if (!node) {
    tree.push(value)
  } else if (node.children.length) {
    setByPath(node.children, path, value, ++index)
  } else {
    node.children.push(value)
  }
}

export default function createTokenTree(
  tokenMatchers: TokenMatcher[]
): TokenNode[] {
  const tree: TokenNode[] = []

  for (const tokenMatcher of tokenMatchers) {
    const pattern = new RegExp(`^${tokenMatcher.pattern.source}`)

    if (tokenMatcher.scope && tokenMatcher.scope.length) {
      tokenMatcher.scope.forEach((scope) => {
        setByPath(tree, scope.split('.'), {
          ...tokenMatcher,
          pattern,
          event: `${scope}.${tokenMatcher.name}`,
          children: [],
        })
      })
    } else {
      tree.push({
        ...tokenMatcher,
        pattern,
        event: tokenMatcher.name,
        children: [],
      })
    }
  }

  return tree
}
