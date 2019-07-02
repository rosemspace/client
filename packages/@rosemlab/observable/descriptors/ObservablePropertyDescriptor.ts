import ObservableObject from '../ObservableObject'
import Observer from '../Observer'

export default interface ObservablePropertyDescriptor {
  configurable?: boolean
  enumerable?: boolean
  writable?: boolean
  get?(target: ObservableObject): any
  set?: Observer
  deep?: boolean
  value?: any
}

const getOwnPropertyNames = Object.getOwnPropertyNames
const hasOwnProperty = Object.prototype.hasOwnProperty

export function normalize(
  descriptor?: ObservablePropertyDescriptor,
  defaultValue?: any
): ObservablePropertyDescriptor {
  if (null != descriptor && getOwnPropertyNames(descriptor).length > 0) {
    // Cater for pre-defined getter/setters.
    const { get } = descriptor
    const hasValue = hasOwnProperty.call(descriptor, 'value')

    if ((get || descriptor.set) && (hasValue || descriptor.writable)) {
      throw new Error(
        'Invalid property descriptor. ' +
          'Cannot both specify accessors and a value or writable attribute'
      )
    }

    if (!get && !hasValue && undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  } else {
    descriptor = {}

    if (undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  }

  return descriptor
}
