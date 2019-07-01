import isNaN from 'lodash/isNaN'
import canRedefineProperty from '@rosemlab/common-util/canRedefineProperty'
import { storage, OBSERVABLE_KEY } from '.'
import normalizeDescriptor from './normalizeDescriptor'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ComputedPropertyDescriptor from './descriptors/ComputedPropertyDescriptor'
import Observable from './Observable'
import Observer from './Observer'

export default function defineComputedProperty(
  target: ObservableObject,
  computedProperty: ObservablePropertyKey,
  descriptor: ComputedPropertyDescriptor & ThisType<ObservableObject>
): void {
  if (!canRedefineProperty(target, computedProperty)) {
    throw new TypeError(
      `Cannot redefine computed property: ${computedProperty}`
    )
  }

  const observable: Observable = target[OBSERVABLE_KEY]

  descriptor = normalizeDescriptor(
    descriptor,
    target[computedProperty]
  )

  const { enumerable, configurable, value, get, set } = descriptor
  const observer: Observer | undefined = value || get

  if (!observer) {
    throw new TypeError(
      'Invalid property descriptor. Computed property descriptor should have value or getter'
    )
  }

  storage.observer = function(
    newValue: any,
    oldValue: any,
    property: ObservablePropertyKey
  ): any {
    target[computedProperty] = observer.call(
      target,
      newValue,
      oldValue,
      property,
      target
    )
  }
  // Collect properties on which this computed property dependent
  let computedValue: any = observer.call(
    target,
    undefined,
    undefined,
    computedProperty,
    target
  )
  Object.defineProperty(target, computedProperty, {
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
          target,
          newValue,
          oldValue,
          computedProperty,
          target
        )

      observable.notifyPropertyObserver(computedProperty, newValue, oldValue)
    },
  })

  storage.observer = undefined
}
