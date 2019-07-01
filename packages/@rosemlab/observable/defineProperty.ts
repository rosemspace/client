import isNaN from 'lodash/isNaN'
import canRedefineProperty from '@rosemlab/common-util/canRedefineProperty'
import { OBSERVABLE_KEY } from './index'
import normalizeDescriptor from './normalizeDescriptor'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ObservablePropertyDescriptor from './descriptors/ObservablePropertyDescriptor'
import Observable from './Observable'

export default function defineProperty(
  target: ObservableObject,
  property: ObservablePropertyKey,
  descriptor?: ObservablePropertyDescriptor & ThisType<ObservableObject>
): void {
  if (!canRedefineProperty(target, property)) {
    throw new TypeError(`Cannot redefine property: ${property}`)
  }

  const observable: Observable = target[OBSERVABLE_KEY]

  descriptor = normalizeDescriptor(descriptor, target[property])

  const { enumerable, configurable, get, set } = descriptor
  let { value } = descriptor

  Object.defineProperty(target, property, {
    enumerable,
    configurable,
    get: function reactiveGetter(): any {
      observable.dependOnProperty(property)

      return get ? get.call(target, target) : value
    },
    set: function reactiveSetter(newValue: any): void {
      const oldValue = get
        ? get.call(target, target)
        : value

      if (
        newValue === oldValue ||
        (isNaN(newValue) && isNaN(oldValue)) ||
        // For accessor properties without setter
        (get && !set)
      ) {
        return
      }

      set
        ? set.call(
            target,
            newValue,
            oldValue,
            property,
            target
          )
        : (value = newValue)
      observable.notifyPropertyObserver(property, newValue, oldValue)
    },
  })
}
