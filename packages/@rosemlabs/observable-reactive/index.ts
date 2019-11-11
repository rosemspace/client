import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import { Primitive } from 'type-fest'
import { ObservableObject, OBSERVATION_KEY } from '@rosemlabs/observable'
import Observer from '@rosemlabs/observable/Observer'
import { ObservablePropertyKey } from '@rosemlabs/observable/ObservableObject'
import { observeProperty } from '@rosemlabs/observable/observe'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import ReactiveObject from './ReactiveObject'
import ReactivePropertyDescriptor from './ReactivePropertyDescriptor'
import defineReactiveProperty from './defineReactiveProperty'
import defineComputedProperty from './defineComputedProperty'

export interface Ref<T extends Primitive = Primitive> extends ReactiveObject {
  value: T
}

export function reactive(target: object): ReactiveObject {
  return new ReactiveObject(target)
}

export function ref<T extends Primitive = Primitive>(
  value: T | ReactivePropertyDescriptor
): Ref<T> {
  if (isObject(value)) {
    const target: Ref<T> = new ReactiveObject() as Ref<T>

    defineReactiveProperty(target, 'value', value)

    if (value.primitiveConversion) {
      Object.defineProperty(target, Symbol.toPrimitive, {
        configurable: true,
        value(
          this: Ref<T>,
          hint: 'default' | 'string' | 'number'
        ): string | number {
          return hint === 'string' ? String(this.value) : Number(this.value)
        },
      })
    }

    return target
  }

  return new ReactiveObject({ value }) as Ref<T>
}

export function computed<T extends Primitive = Primitive>(
  value: Observer | ComputedPropertyDescriptor
): Ref<T> {
  const target: Ref<T> = new ReactiveObject() as Ref<T>

  if (isFunction(value)) {
    defineComputedProperty(target, 'value', { get: value })
  } else {
    defineComputedProperty(target, 'value', value)

    if (value.primitiveConversion) {
      Object.defineProperty(target, Symbol.toPrimitive, {
        configurable: true,
        value(
          this: Ref<T>,
          hint: 'default' | 'string' | 'number'
        ): string | number {
          return hint === 'string' ? String(this.value) : Number(this.value)
        },
      })
    }
  }

  return target
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
