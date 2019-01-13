const getOwnPropertyNames = Object.getOwnPropertyNames

export default function isEmptyObject(value: Record<PropertyKey, any>): boolean {
  return (
    // "null" and "undefined" are "empty".
    null == value ||
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    (value.length > 0
      ? false
      : // Object including length with a zero value are empty.
        value.length === 0 ||
        // Does it have any properties of its own?
        getOwnPropertyNames(value).length <= 0)
  )
}
