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

  const { enumerable, configurable, get, set } = descriptor
  const observer: Observer | undefined = get

  if (!observer) {
    throw new TypeError(
      'Invalid property descriptor. Computed property descriptor should have value or getter'
    )
  }

  const observable: Observable = target[OBSERVABLE_KEY]
  let computedValue: any

  storage.observer = function(
    newValue: any,
    oldValue: any,
    property: ObservablePropertyKey
  ): any {
    const newComputedValue: any = observer.call(
      target,
      newValue,
      oldValue,
      property,
      target
    )

    // Reactive setter functionality
    if (
      newComputedValue === computedValue ||
      (isNaN(newComputedValue) && isNaN(computedValue))
    ) {
      return
    }

    if (set) {
      set.call(
        target,
        newComputedValue,
        computedValue,
        computedProperty,
        target
      )
    }

    observable.notifyPropertyObserver(
      computedProperty,
      newComputedValue,
      computedValue
    )
    computedValue = newComputedValue
  }
  // Collect properties on which this computed property dependent
  computedValue = observer.call(
    target,
    undefined,
    undefined,
    computedProperty,
    target
  )

  nativeDefineProperty(target, computedProperty, {
    enumerable,
    configurable,
    get: function reactiveGetter(): any {
      observable.dependOnProperty(computedProperty)

      return computedValue
    },
  })

  storage.observer = undefined
}
