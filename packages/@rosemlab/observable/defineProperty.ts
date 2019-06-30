import isNaN from 'lodash/isNaN'
import canRedefineProperty from '@rosemlab/common-util/canRedefineProperty'
import { OBSERVABLE_KEY } from './index'
import normalizeDescriptor from './normalizeDescriptor'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ObservablePropertyDescriptor from './ObservablePropertyDescriptor'
import Observable from './Observable'

export default function defineProperty(
  observableObject: ObservableObject,
  property: ObservablePropertyKey,
  descriptor?: ObservablePropertyDescriptor & ThisType<ObservableObject>
): void {
  if (!canRedefineProperty(observableObject, property)) {
    throw new TypeError(`Cannot redefine property: ${property}`)
  }

  const observable: Observable = observableObject[OBSERVABLE_KEY]

  descriptor = normalizeDescriptor(descriptor, observableObject[property])

  const { enumerable, configurable, get, set } = descriptor
  let { value } = descriptor

  Object.defineProperty(observableObject, property, {
    enumerable,
    configurable,
    get: function reactiveGetter(): any {
      observable.dependOnProperty(property)

      return get ? get.call(observableObject, observableObject) : value
    },
    set: function reactiveSetter(newValue: any): void {
      const oldValue = get
        ? get.call(observableObject, observableObject)
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
            observableObject,
            newValue,
            oldValue,
            property,
            observableObject
          )
        : (value = newValue)
      observable.notifyPropertyObserver(property, newValue, oldValue)
    },
  })
}
