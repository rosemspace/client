/**
 * Defines non-writable/enumerable properties of the provided target object.
 *
 * @param {Object} target - Object for which to define properties.
 * @param {Object} props - Properties to be defined.
 * @returns {Object} Target object.
 */
export default function defineConfigurableProperties<T>(target: T, props: Record<string | number, any>): T {
  for (const key of Object.keys(props)) {
    Object.defineProperty(target, key, {
      value: props[key],
      enumerable: false,
      writable: false,
      configurable: true,
    })
  }

  return target
}
