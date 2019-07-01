import isFunction from 'lodash/isFunction'
import isPrimitive from '@rosemlab/common-util/isPrimitive'
import supportsSymbol from '@rosemlab/common-util/supportsSymbol'
import Storage from './Storage'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'
import ObservablePropertyDescriptor from './descriptors/ObservablePropertyDescriptor'
import ComputedPropertyDescriptor from './descriptors/ComputedPropertyDescriptor'
import defineComputedProperty from './defineComputedProperty'
import observeProperty from './observeProperty'

export const OBSERVABLE_KEY: unique symbol = supportsSymbol
  ? Symbol('observable')
  : ('__ob__' as any)

export const storage: Storage = {}

export function state(target: object): ObservableObject {
  return new ObservableObject(target)
}

export function value(
  value: Primitive | ObservablePropertyDescriptor
): ObservableObject {
  return new ObservableObject(
    isPrimitive(value) ? { value } : (value as ObservablePropertyDescriptor)
  )
}

export function computed(
  value: Observer | ComputedPropertyDescriptor
): ObservableObject {
  const target: ObservableObject = new ObservableObject()

  defineComputedProperty(
    target,
    'value',
    isFunction(value)
      ? {
          get: value,
        }
      : value
  )

  return target
}

export function watch(
  observable: ObservableObject | (() => any),
  observer: Observer
): void {
  if (isFunction(observable)) {
    let oldValue: any

    storage.observer = (
      _oldValue: any,
      _newValue: any,
      property: ObservablePropertyKey,
      target: ObservableObject
    ) => {
      const newValue: any = observable()

      observer.call(target, newValue, oldValue, property, target)
      oldValue = newValue
    }
    // Collect properties on which this computed property dependent
    oldValue = observable()
    storage.observer = undefined
  } else {
    observeProperty(observable, 'value', observer)
  }
}

const SSR_ATTRIBUTE = 'data-server-rendered'

const ASSET_TYPES = ['component', 'directive', 'filter']

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
]

const arrayMethodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]
