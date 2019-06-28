import GenericPropertyDescriptor from './GenericPropertyDescriptor'

const getOwnPropertyNames = Object.getOwnPropertyNames
const hasOwnProperty = Object.prototype.hasOwnProperty

export default function normalizeDescriptor(
  descriptor?: GenericPropertyDescriptor,
  defaultValue?: any
): GenericPropertyDescriptor {
  if (null != descriptor && getOwnPropertyNames(descriptor).length > 0) {
    // Cater for pre-defined getter/setters.
    const { writable, get, set } = descriptor
    const hasValue = hasOwnProperty.call(descriptor, 'value')

    if ((get || set) && (hasValue || writable)) {
      throw new Error(
        'Invalid property descriptor. Cannot both specify accessors and a value or writable attribute'
      )
    }

    descriptor = { configurable: true, enumerable: true, ...descriptor }

    if (!get && !hasValue && undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  } else {
    descriptor = { configurable: true, enumerable: true }

    if (undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  }

  return descriptor
}
