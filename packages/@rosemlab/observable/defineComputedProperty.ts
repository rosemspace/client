import isNaN from 'lodash/isNaN'
import canRedefineProperty from '@rosemlab/common-util/canRedefineProperty'
import { storage, OBSERVABLE_KEY } from '.'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ComputedPropertyDescriptor, {
  normalize,
} from './descriptors/ComputedPropertyDescriptor'
import Observable from './Observable'
import Observer from './Observer'

const nativeDefineProperty = Object.defineProperty

export default function defineComputedProperty(
  target: ObservableObject,
  computedProperty: ObservablePropertyKey,
  descriptor: ComputedPropertyDescriptor
): void {
  if (!canRedefineProperty(target, computedProperty)) {
    throw new TypeError(
      `Cannot redefine computed property: ${computedProperty}`
    )
  }

  descriptor = normalize(descriptor, target[computedProperty])

  const observable: Observable = target[OBSERVABLE_KEY]
  const { enumerable, configurable, get, set } = descriptor
  const observer: Observer | undefined = get

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
    // todo improve allowComputed
    storage.allowComputed = true
    target[computedProperty] = observer.call(
      target,
      newValue,
      oldValue,
      property,
      target
    )
    storage.allowComputed = false
  }
  // Collect properties on which this computed property dependent
  let computedValue: any = observer.call(
    target,
    undefined,
    undefined,
    computedProperty,
    target
  )

  nativeDefineProperty(target, computedProperty, {
    ...{
      enumerable,
      configurable,
    },
    get: function reactiveGetter(): any {
      observable.dependOnProperty(computedProperty)

      return computedValue
    },
    set: function reactiveSetter(newValue: any): void {
      if (
        newValue === computedValue ||
        (isNaN(newValue) && isNaN(computedValue))
      ) {
        return
      }

      if (set) {
        set.call(target, newValue, computedValue, computedProperty, target)
      } else if (!storage.allowComputed) {
        // todo: improve error message
        throw new Error('Setter is not defined')
      }

      observable.notifyPropertyObserver(
        computedProperty,
        newValue,
        computedValue
      )
      computedValue = newValue
    },
  })

  storage.observer = undefined
}
