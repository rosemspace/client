import { isNaN } from 'lodash-es'
import canRedefineProperty from '@rosem-util/common/canRedefineProperty'
import { OBSERVER_KEY } from './index'
import normalizeDescriptor from './normalizeDescriptor'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import Observer from './Observer'

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

  const storage: Observer = observableObject[OBSERVER_KEY]
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

  storage.dependentObserver = function(
    newValue: any,
    oldValue: any,
    property: ObservablePropertyKey,
    observableObject: ObservableObject
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
      storage.dependOnProperty(computedProperty)

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

        storage.dispatchPropertyObservers(computedProperty, newValue, oldValue)
      }
    },
  })

  delete storage.dependentObserver
}
