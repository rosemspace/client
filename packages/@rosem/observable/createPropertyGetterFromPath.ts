/**
 * Parse simple path.
 */
import unicodeLetters from '@rosem/dom-parser/unicodeLetters'

// const bailRE = /^[\w$](?:(?:[\w.]|\.\$)*?\w)?$/
const bailRE = new RegExp(`[^${unicodeLetters}.$]`)

export default function createPropertyGetterFromPath(
  path: string,
  separator: string = '.'
): Function | void {
  if (!bailRE.test(path)) {
    return
  }

  const segments = path.split(separator)
  const length = segments.length

  return function(object: any): any {
    for (let i = 0; i < length; ++i) {
      if (!object) return

      object = object[segments[i]]
    }

    return object
  }
}
