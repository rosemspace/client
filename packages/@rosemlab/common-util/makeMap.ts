/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
export default function makeMap(
  data: any[] | string,
  options: {
    delimiter: string
    expectsLowerCase?: boolean
  } = {
    delimiter: ',',
  }
): (key: string) => true | void {
  const map = Object.create(null)
  const list: any[] = Array.isArray(data) ? data : data.split(options.delimiter)

  for (let i = 0; i < list.length; ++i) {
    map[list[i]] = true
  }

  return options.expectsLowerCase
    ? (val) => map[val.toLowerCase()]
    : (val) => map[val]
}
