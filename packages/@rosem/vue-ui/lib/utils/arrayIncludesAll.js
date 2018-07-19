export default function arrayIncludesAll(array, values) {
  return ![...new Set(values)].some(item => !array.includes(item))
}
