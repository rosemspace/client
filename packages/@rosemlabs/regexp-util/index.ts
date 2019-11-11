export function getExactDisjunctionRegExpFromArray(
  list: string[],
  flags?: string
): RegExp {
  return new RegExp(`^${list.join('|')}$`, flags)
}

type StackedTokenRegExpCache = { [stackToken: string]: RegExp }

const stackedTokenRegExpCache: StackedTokenRegExpCache = {}

export default function getStackedTokenRegExp(
  tokenRegExpPart: string,
  tokenName: string = tokenRegExpPart
): RegExp {
  return (
    stackedTokenRegExpCache[tokenName] ||
    (stackedTokenRegExpCache[tokenName] = new RegExp(
      `([\\s\\S]*?)(</${tokenName}[^>]*>)`,
      'i'
    ))
  )
}
