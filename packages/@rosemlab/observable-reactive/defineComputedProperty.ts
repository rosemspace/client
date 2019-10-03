import isNaN from 'lodash/isNaN'
import canRedefineProperty from '@rosemlab/common-util/canRedefineProperty'
import { OBSERVATION_KEY } from '@rosemlab/observable'
import Observable from '@rosemlab/observable/Observable'
import Observer from '@rosemlab/observable/Observer'
import ObservableObject, {
  ObservablePropertyKey,
} from '@rosemlab/observable/ObservableObject'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import ReactiveObject from './ReactiveObject'

const nativeDefineProperty = Object.defineProperty
const getOwnPropertyNames = Object.getOwnPropertyNames

export default function defineComputedProperty(
  target: ReactiveObject,
  computedProperty: ObservablePropertyKey,
  descriptor: ComputedPropertyDescriptor & ThisType<ReactiveObject>
): void {
  if (!canRedefineProperty(target, computedProperty)) {
    throw new TypeError(
      `Cannot redefine computed property: ${computedProperty}`
    )
  }

  descriptor = normalizeDescriptor(descriptor, target[computedProperty])

  const { configurable = true, enumerable = true, get, set } = descriptor
  const observer: Observer<ReactiveObject> | undefined = get

  if (!observer) {
    throw new TypeError(
      'Invalid property descriptor. Computed property descriptor should have value or getter'
    )
  }

  const observable: Observable<ObservableObject> = target[OBSERVATION_KEY]
  let computedValue: any

  ReactiveObject[OBSERVATION_KEY] = function(
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

    observable.notifyProperty(newComputedValue, computedValue, computedProperty)
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
    configurable,
    enumerable,
    get: function reactiveGetter(): any {
      // We are just collecting dependencies (reactions)
      if (ReactiveObject[OBSERVATION_KEY]) {
        observable.observeProperty(
          computedProperty,
          ReactiveObject[OBSERVATION_KEY]!
        )
      }

      return computedValue
    },
  })

  ReactiveObject[OBSERVATION_KEY] = undefined
}

export function normalizeDescriptor(
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
