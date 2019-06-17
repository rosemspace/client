export function getExactDisjunctionRegExpFromArray(
  list: string[],
  flags?: string
): RegExp {
  return new RegExp(`^${list.join('|')}$`, flags)
}
