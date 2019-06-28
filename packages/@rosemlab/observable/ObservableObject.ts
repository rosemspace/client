import { OBSERVER_KEY } from './index'
import {
  NON_ENUMERABLE_DESCRIPTOR,
  PERMISSIVE_DESCRIPTOR,
} from './GenericPropertyDescriptor'
import defineProperty from './defineProperty'
import defineComputedProperty from './defineComputedProperty'
import observeProperty from './observeProperty'
import observeProperties from './observeProperties'
import Observer from './Observer'

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const nativeDefineProperty = Object.defineProperty

export type ObservablePropertyKey = string | number

export default class ObservableObject implements Object {
  [index: number]: any
  [key: string]: any

  private [OBSERVER_KEY]: Observer

  public constructor(object: object) {
    Object.defineProperty(this, OBSERVER_KEY, {
      ...NON_ENUMERABLE_DESCRIPTOR,
      value: new Observer(this),
    })

    // todo improve perf
    for (const [property, value] of Object.entries(object)) {
      const descriptor = getOwnPropertyDescriptor(object, property)

      if (null == descriptor || true === descriptor.configurable) {
        ObservableObject.defineProperty(
          this,
          property,
          null == descriptor ? { ...PERMISSIVE_DESCRIPTOR, value } : descriptor
        )
      } else {
        nativeDefineProperty(this, property, descriptor)
      }
    }
  }

  public static create(object: object): ObservableObject {
    return new ObservableObject(object)
  }

  public static defineProperty: Function = defineProperty

  public static defineComputedProperty: Function = defineComputedProperty

  public static observeProperty: Function = observeProperty

  public static observeProperties: Function = observeProperties
}
