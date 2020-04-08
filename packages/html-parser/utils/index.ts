const stackedTokenRegExpCache: { [stackToken: string]: RegExp } = {}

export function getStackedTagRegExp(tagName: string): RegExp {
  return (
    stackedTokenRegExpCache[tagName] ||
    (stackedTokenRegExpCache[tagName] = new RegExp(
      `([\\s\\S]*?)(</${tagName}[^>]*>)`,
      'i'
    ))
  )
}

export function getExactDisjunctionRegExpFromArray(
  list: string[],
  flags?: string
): RegExp {
  return new RegExp(`^${list.join('|')}$`, flags)
}

export function startsWithRegExp(regExp: RegExp): RegExp {
  return new RegExp(`^${regExp.source}`, regExp.flags)
}

export function endsWithRegExp(regExp: RegExp): RegExp {
  return new RegExp(`${regExp.source}$`, regExp.flags)
}

export function regExpExactI(pattern: string): RegExp {
  return new RegExp(`^(?:${pattern})$`, 'i')
}
