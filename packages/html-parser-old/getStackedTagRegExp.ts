type StackedTagRegExpCache = { [stackTag: string]: RegExp }

const stackedTagRegExpCache: StackedTagRegExpCache = {}

export default function getStackedTagRegExp(tagName: string): RegExp {
  return (
    stackedTagRegExpCache[tagName] ||
    (stackedTagRegExpCache[tagName] = new RegExp(
      `([\\s\\S]*?)(</${tagName}[^>]*>)`,
      'i'
    ))
  )
}
