import forEach from 'lodash/forEach'
import {
  NON_ENUMERABLE_DESCRIPTOR,
  OBSERVATION_KEY,
  PERMISSIVE_DESCRIPTOR,
} from '@rosemlab/observable'
import Observable from '@rosemlab/observable/Observable'
import Observer from '@rosemlab/observable/Observer'
import ObservableObject, {
  ObservablePropertyKey,
} from '@rosemlab/observable/ObservableObject'
import ReactivePropertyDescriptor from './ReactivePropertyDescriptor'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import defineReactiveProperty from './defineReactiveProperty'
import defineComputedProperty from './defineComputedProperty'

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const nativeDefineProperty = Object.defineProperty

export default class ReactiveObject extends ObservableObject {
  static [OBSERVATION_KEY]?: Observer

  constructor(object?: object | null) {
    super(object)

    if (null == object) {
      object = {}
    }

    nativeDefineProperty(this, OBSERVATION_KEY, {
      ...NON_ENUMERABLE_DESCRIPTOR,
      value: new Observable(this),
    })

    forEach(object, (value: any, property: string | number) => {
      const descriptor = getOwnPropertyDescriptor(object, property)

      if (null == descriptor || true === descriptor.configurable) {
        defineReactiveProperty(
          this,
          property,
          null == descriptor ? { ...PERMISSIVE_DESCRIPTOR, value } : descriptor
        )
      } else {
        nativeDefineProperty(this, property, descriptor)
      }
    })
  }

  static create(object: object | null): ReactiveObject {
    return new ReactiveObject(object)
  }

  defineReactiveProperty(
    property: ObservablePropertyKey,
    descriptor?: ReactivePropertyDescriptor & ThisType<ObservableObject>
  ): void {
    defineReactiveProperty(this, property, descriptor)
  }

  defineComputedProperty(
    computedProperty: ObservablePropertyKey,
    descriptor: ComputedPropertyDescriptor & ThisType<ReactiveObject>
  ): void {
    defineComputedProperty(this, computedProperty, descriptor)
  }
}
