/**
 * Define a property.
 */
export default function defineProperty(
  object: Object,
  key: string,
  value: any,
  enumerable: boolean = false
) {
  Object.defineProperty(object, key, {
    value: value,
    enumerable: enumerable,
    writable: true,
    configurable: true,
  })
}
