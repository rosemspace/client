const arrayIncludesValues = <T>(array: Array<T>, values: any[]): boolean =>
  ![...new Set(values)].some((item) => !array.includes(item))

/**
 * Remove an item from an array.
 */
export function removeArrayItem<T>(
  array: Array<T>,
  item: T
): Array<T> | void {
  if (array.length <= 0) {
    return
  }

  const index = array.indexOf(item)

  if (index < 0) {
    return
  }

  return array.splice(index, 1)
}
