import isNaN from 'lodash/isNaN'
import canRedefineProperty from '@rosemlab/common-util/canRedefineProperty'
import { storage, OBSERVABLE_KEY } from '.'
import normalizeDescriptor from './normalizeDescriptor'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import Observable from './Observable'

export default function defineComputedProperty(
  observableObject: ObservableObject,
  computedProperty: ObservablePropertyKey,
  descriptor: ComputedPropertyDescriptor & ThisType<ObservableObject>
): void {
  if (!canRedefineProperty(observableObject, computedProperty)) {
    throw new TypeError(
      `Cannot redefine computed property: ${computedProperty}`
    )
  }

  const observable: Observable = observableObject[OBSERVABLE_KEY]

  descriptor = normalizeDescriptor(
    descriptor,
    observableObject[computedProperty]
  )

  const { enumerable, configurable, value, get, set } = descriptor
  const getValue = value || get

  if (!getValue) {
    throw new TypeError(
      'Invalid property descriptor. Computed property descriptor should have value or getter'
    )
  }

  storage.observer = function(
    newValue: any,
    oldValue: any,
    property: ObservablePropertyKey
  ): any {
    observableObject[computedProperty] = getValue.call(
      observableObject,
      newValue,
      oldValue,
      property,
      observableObject
    )
  }
  // Collect properties on which this computed property dependent
  let computedValue: any = getValue.call(
    observableObject,
    undefined,
    undefined,
    computedProperty,
    observableObject
  )
  Object.defineProperty(observableObject, computedProperty, {
    ...{
      enumerable,
      configurable,
    },
    get: function reactiveGetter(): any {
      observable.dependOnProperty(computedProperty)

      return computedValue
    },
    set: function reactiveSetter(newValue: any): void {
      const oldValue = computedValue

      if (newValue === oldValue || (isNaN(newValue) && isNaN(oldValue))) {
        return
      }

      computedValue = newValue

      if (set) {
        set.call(
          observableObject,
          newValue,
          oldValue,
          computedProperty,
          observableObject
        )

        observable.notifyPropertyObserver(computedProperty, newValue, oldValue)
      }
    },
  })

  delete storage.observer
}
