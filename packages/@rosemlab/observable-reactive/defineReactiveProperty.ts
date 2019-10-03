import isNaN from 'lodash/isNaN'
import canRedefineProperty from '@rosemlab/common-util/canRedefineProperty'
import { OBSERVATION_KEY } from '@rosemlab/observable'
import Observable from '@rosemlab/observable/Observable'
import ObservableObject, {
  ObservablePropertyKey,
} from '@rosemlab/observable/ObservableObject'
import ReactiveObject from './ReactiveObject'
import ReactivePropertyDescriptor from './ReactivePropertyDescriptor'

const getOwnPropertyNames = Object.getOwnPropertyNames
const nativeDefineProperty = Object.defineProperty
const hasOwnProperty = Object.prototype.hasOwnProperty

export default function defineReactiveProperty(
  target: ReactiveObject,
  property: ObservablePropertyKey,
  descriptor?: ReactivePropertyDescriptor & ThisType<ReactiveObject>
): void {
  if (!canRedefineProperty(target, property)) {
    throw new TypeError(`Cannot redefine property: ${property}`)
  }

  descriptor = normalizeDescriptor(descriptor, target[property])

  const observable: Observable<ObservableObject> = target[OBSERVATION_KEY]
  const { configurable = true, enumerable = true, get, set } = descriptor
  let { value } = descriptor

  nativeDefineProperty(target, property, {
    configurable,
    enumerable,
    get: function reactiveGetter(): any {
      // We are just collecting dependencies (reactions)
      if (ReactiveObject[OBSERVATION_KEY]) {
        observable.observeProperty(property, ReactiveObject[OBSERVATION_KEY]!)
      }

      return get ? get.call(target, target) : value
    },
    set: function reactiveSetter(newValue: any): void {
      const oldValue = get ? get.call(target, target) : value

      if (
        newValue === oldValue ||
        (isNaN(newValue) && isNaN(oldValue)) ||
        // For accessor properties without setter
        (get && !set)
      ) {
        return
      }

      set
        ? set.call(target, newValue, oldValue, property, target)
        : (value = newValue)
      observable.notifyProperty(newValue, oldValue, property)
    },
  })
}

export function normalizeDescriptor(
  descriptor?: ReactivePropertyDescriptor,
  defaultValue?: any
): ReactivePropertyDescriptor {
  if (null != descriptor && getOwnPropertyNames(descriptor).length > 0) {
    // Cater for pre-defined getter/setters.
    const { get } = descriptor
    const hasValue = hasOwnProperty.call(descriptor, 'value')

    if ((get || descriptor.set) && (hasValue || descriptor.writable)) {
      throw new Error(
        'Invalid property descriptor. ' +
          'Cannot both specify accessors and a value or writable attribute'
      )
    }

    if (!get && !hasValue && undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  } else {
    descriptor = {}

    if (undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  }

  return descriptor
}
