import forEach from 'lodash/forEach'
import {
  NON_ENUMERABLE_DESCRIPTOR,
  OBSERVATION_KEY,
  PERMISSIVE_DESCRIPTOR,
} from '@rosemlabs/observable'
import Observable from '@rosemlabs/observable/Observable'
import Observer from '@rosemlabs/observable/Observer'
import ObservableObject from '@rosemlabs/observable/ObservableObject'
import defineReactiveProperty from './defineReactiveProperty'

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const nativeDefineProperty = Object.defineProperty

export default class ReactiveObject extends ObservableObject {
  static [OBSERVATION_KEY]: Observer | undefined

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
}
