export default function isIterable(target: any): boolean {
  return null != target && 'function' === typeof target[Symbol.iterator]
}
