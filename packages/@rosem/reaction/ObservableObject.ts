import ObservableObjectStorage from './ObservableObjectStorage'
import ObservablePropertyDescriptor from './ObservablePropertyDescriptor'
import ObserverFunction from './ObserverFunction'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import {
  ALL_ABLE,
  NON_ENUMERABLE,
  PropertyDescriptorAblePart,
} from './property'

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const getOwnPropertyNames = Object.getOwnPropertyNames
const nativeDefineProperty = Object.defineProperty
const hasOwnProperty = Object.prototype.hasOwnProperty
const isNaN = Number.isNaN
const storageKey = Symbol.for('observable')
const DEFAULT_DESCRIPTOR = {
  configurable: true,
  enumerable: true,
}

export type ObservablePropertyKey = string | number

function canRedefineProperty(object: Object, property: PropertyKey): boolean {
  const definedDescriptor = getOwnPropertyDescriptor(object, property)

  return null == definedDescriptor || true === definedDescriptor.configurable
}

function getObservableData(
  observableObject: ObservableObject,
  property: ObservablePropertyKey,
  descriptor?: (ObservablePropertyDescriptor | ComputedPropertyDescriptor) &
    ThisType<ObservableObject>
): any {
  const normalizedDescriptor: PropertyDescriptorAblePart = DEFAULT_DESCRIPTOR
  let value: any
  let get: Function | undefined
  let set: Function | undefined

  if (null != descriptor && getOwnPropertyNames(descriptor).length > 0) {
    // Cater for pre-defined getter/setters.
    get = descriptor.get
    set = descriptor.set
    value =
      (!get || set) && !hasOwnProperty.call(descriptor, 'value')
        ? observableObject[property]
        : descriptor.value

    const { enumerable, configurable } = descriptor

    if (null != enumerable) {
      normalizedDescriptor.enumerable = enumerable
    }

    if (null != configurable) {
      normalizedDescriptor.configurable = configurable
    }
  }

  return {
    normalizedDescriptor,
    value,
    set,
    get,
  }
}

export default class ObservableObject implements Object {
  [index: number]: any
  [key: string]: any

  public static readonly observable: symbol = storageKey

  private [storageKey]: ObservableObjectStorage

  public constructor(object: object) {
    Object.defineProperty(this, storageKey, {
      ...NON_ENUMERABLE,
      value: new ObservableObjectStorage(object, this),
    })

    for (const [property, value] of Object.entries(object)) {
      const descriptor = getOwnPropertyDescriptor(object, property)

      if (null == descriptor || true === descriptor.configurable) {
        ObservableObject.defineProperty(
          this,
          property,
          null == descriptor ? { ...ALL_ABLE, value } : descriptor
        )
      } else {
        nativeDefineProperty(this, property, descriptor)
      }
    }
  }

  public static create(object: object): ObservableObject {
    return new ObservableObject(object)
  }

  public static defineProperty(
    observableObject: ObservableObject,
    property: ObservablePropertyKey,
    descriptor?: ObservablePropertyDescriptor & ThisType<ObservableObject>
  ): void {
    if (!canRedefineProperty(observableObject, property)) {
      throw new TypeError(`Cannot redefine property: ${property}`)
    }

    const storage: ObservableObjectStorage = observableObject[storageKey]
    const data: any = getObservableData(observableObject, property, descriptor)
    const { normalizedDescriptor, get, set } = data
    let { value } = data

    Object.defineProperty(observableObject, property, {
      ...normalizedDescriptor,
      get: function reactiveGetter(): any {
        // Depend on the property
        if (storage.dependentObserver) {
          storage.observeProperty(property, storage.dependentObserver)
        }

        return get ? get.call(observableObject, observableObject) : value
      },
      set: function reactiveSetter(newValue: any): void {
        const oldValue = get ? get.call(observableObject) : value

        if (
          newValue === oldValue ||
          (isNaN(newValue) && isNaN(oldValue)) ||
          // For accessor properties without setter
          (get && !set)
        ) {
          return
        }

        set
          ? set.call(
              observableObject,
              newValue,
              oldValue,
              property,
              observableObject
            )
          : (value = newValue)
        storage.dispatchPropertyObservers(property, newValue, oldValue)
      },
    })
  }

  public static defineComputedProperty(
    observableObject: ObservableObject,
    computedProperty: ObservablePropertyKey,
    descriptor: ComputedPropertyDescriptor & ThisType<ObservableObject>
  ): void {
    if (!canRedefineProperty(observableObject, computedProperty)) {
      throw new TypeError(
        `Cannot redefine computed property: ${computedProperty}`
      )
    }

    const storage: ObservableObjectStorage = observableObject[storageKey]
    const data: any = getObservableData(
      observableObject,
      computedProperty,
      descriptor
    )
    const { normalizedDescriptor, get, set } = data
    const getter = data.value || get

    if (!getter) {
      throw new TypeError(
        'Computed property descriptor should have value or getter'
      )
    }

    storage.dependentObserver = function(
      newValue: any,
      oldValue: any,
      property: ObservablePropertyKey,
      observableObject: ObservableObject
    ): void {
      observableObject[computedProperty] = getter.call(
        observableObject,
        newValue,
        oldValue,
        property,
        observableObject
      )
    }
    // Collect properties on which this computed property dependent
    let value = getter.call(
      observableObject,
      undefined,
      undefined,
      computedProperty,
      observableObject
    )

    Object.defineProperty(observableObject, computedProperty, {
      ...normalizedDescriptor,
      get: function reactiveGetter(): any {
        // Depend on the property
        if (storage.dependentObserver) {
          storage.observeProperty(computedProperty, storage.dependentObserver)
        }

        return value
      },
      set: function reactiveSetter(newValue: any): void {
        const oldValue = value

        if (newValue === oldValue || (isNaN(newValue) && isNaN(oldValue))) {
          return
        }

        set &&
          set.call(
            observableObject,
            newValue,
            oldValue,
            computedProperty,
            observableObject
          )
        value = newValue
        storage.dispatchPropertyObservers(computedProperty, newValue, oldValue)
      },
    })

    delete storage.dependentObserver
  }

  public static observeProperty(
    observableObject: ObservableObject,
    property: ObservablePropertyKey,
    observer: ObserverFunction
  ): void {
    observableObject[storageKey].observeProperty(property, observer)
  }

  public static observeProperties(
    observableObject: ObservableObject,
    properties: Array<ObservablePropertyKey>,
    observer: ObserverFunction
  ): void {
    properties.forEach(function(property: ObservablePropertyKey): void {
      observableObject[storageKey].observeProperty(property, observer)
    })
  }
}

export const defineProperty = ObservableObject.defineProperty

export const defineComputedProperty = ObservableObject.defineComputedProperty
