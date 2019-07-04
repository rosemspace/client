import defineObservableProperty from '@rosemlab/observable/defineObservableProperty'
import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
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

export const PERMISSIVE_DESCRIPTOR = {
  configurable: true,
  enumerable: true,
  writable: true,
}

export const NON_ENUMERABLE_DESCRIPTOR = {
  configurable: true,
  enumerable: false,
  writable: true,
}

export const storage: Storage = {}

export function state(target: object): ObservableObject {
  return new ObservableObject(target)
}

export function value(
  value: Primitive | ObservablePropertyDescriptor
): ObservableObject {
  if (isObject(value)) {
    const target: ObservableObject = new ObservableObject()

    defineObservableProperty(target, 'value', value)

    return target
  }

  return new ObservableObject({ value })
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
