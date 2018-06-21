function arrayIncludesValues(array, values) {
  return ![...(new Set(values))].some(item => !array.includes(item))
}
