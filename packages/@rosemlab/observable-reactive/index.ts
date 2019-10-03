import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import { Primitive } from '@rosemlab/types'
import { ObservableObject, OBSERVATION_KEY } from '@rosemlab/observable'
import Observer from '@rosemlab/observable/Observer'
import { ObservablePropertyKey } from '@rosemlab/observable/ObservableObject'
import { observeProperty } from '@rosemlab/observable/observe'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import ReactiveObject from './ReactiveObject'
import ReactivePropertyDescriptor from './ReactivePropertyDescriptor'
import defineReactiveProperty from './defineReactiveProperty'
import defineComputedProperty from './defineComputedProperty'

export interface Ref extends ReactiveObject {
  value: any
}

export function reactive(target: object): ReactiveObject {
  return new ReactiveObject(target)
}

export function ref(value: Primitive | ReactivePropertyDescriptor): Ref {
  if (isObject(value)) {
    const target: ReactiveObject = new ReactiveObject()
    defineReactiveProperty(target, 'value', value)

    return target as Ref
  }

  return new ReactiveObject({ value }) as Ref
}

export function computed(value: Observer | ComputedPropertyDescriptor): Ref {
  const target: ReactiveObject = new ReactiveObject()

  defineComputedProperty(
    target,
    'value',
    isFunction(value)
      ? {
          get: value,
        }
      : value
  )

  return target as Ref
}

export function watch(
  reactive: ReactiveObject | (() => any),
  observer: Observer
): void {
  if (isFunction(reactive)) {
    let oldResultValue: any

    ReactiveObject[OBSERVATION_KEY] = (
      newValue: any,
      oldValue: any,
      property: ObservablePropertyKey,
      target: ObservableObject
    ) => {
      const newResultValue: any = reactive()

      observer.call(target, newResultValue, oldResultValue, property, target)
      oldResultValue = newResultValue
    }
    // Collect properties on which this computed property dependent
    oldResultValue = reactive()
    ReactiveObject[OBSERVATION_KEY] = undefined
  } else {
    observeProperty(reactive, 'value', observer)
  }
}
