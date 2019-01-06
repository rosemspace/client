/**
 * Remove an item from an array.
 */
export default function removeArrayItem(array: Array<any>, item: any): Array<any> | void {
  if (array.length) {
    const index = array.indexOf(item)

    if (index >= 0) {
      return array.splice(index, 1)
    }
  }
}
