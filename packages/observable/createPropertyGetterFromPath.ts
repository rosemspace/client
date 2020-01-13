/**
 * Parse simple path.
 */
const bailRE = /^[\w$](?:(?:[\w.]|\.\$)*?\w)?$/
// const bailRE = new RegExp(`[^${pcenCharRegExp.source}.$]`)

export default function createPropertyGetterFromPath(
  path: string,
  separator = '.'
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
