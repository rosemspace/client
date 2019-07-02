import Observer from '../Observer'

export default interface ComputedPropertyDescriptor {
  configurable?: boolean
  enumerable?: boolean
  get?: Observer
  set?: Observer
  noCache?: boolean
}

const getOwnPropertyNames = Object.getOwnPropertyNames

export function normalize(
  descriptor?: ComputedPropertyDescriptor,
  defaultValue?: any
): ComputedPropertyDescriptor {
  if (null != descriptor && getOwnPropertyNames(descriptor).length > 0) {
    if (!descriptor.get && undefined !== defaultValue) {
      descriptor.get = (): void => defaultValue
    }
  } else {
    descriptor = {}

    if (undefined !== defaultValue) {
      descriptor.get = (): void => defaultValue
    }
  }

  if (!descriptor.get) {
    throw new Error('Invalid property descriptor. Accessor must be specified')
  }

  return descriptor
}
