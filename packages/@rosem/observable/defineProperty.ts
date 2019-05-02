import { isNaN } from 'lodash-es'
import canRedefineProperty from '@rosem/common-util/canRedefineProperty'
import { OBSERVER_KEY } from './index'
import normalizeDescriptor from './normalizeDescriptor'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ObservablePropertyDescriptor from './ObservablePropertyDescriptor'
import Observer from './Observer'

export default function defineProperty(
  observableObject: ObservableObject,
  property: ObservablePropertyKey,
  descriptor?: ObservablePropertyDescriptor & ThisType<ObservableObject>
): void {
  if (!canRedefineProperty(observableObject, property)) {
    throw new TypeError(`Cannot redefine property: ${property}`)
  }

  const storage: Observer = observableObject[OBSERVER_KEY]
  descriptor = normalizeDescriptor(descriptor, observableObject[property])
  const { enumerable, configurable, get, set } = descriptor
  let { value } = descriptor

  Object.defineProperty(observableObject, property, {
    enumerable,
    configurable,
    get: function reactiveGetter(): any {
      storage.dependOnProperty(property)

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
      storage.dispatchPropertyObservers(property, newValue, oldValue)
    },
  })
}
