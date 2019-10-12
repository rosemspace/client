/**
 * Remove an item from an array.
 */
export default function removeArrayItem<T>(
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
