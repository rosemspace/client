import Observer from './Observer'
import ObservablePropertyDescriptor from './ObservablePropertyDescriptor'
import ObserveFunction from './ObserveFunction'
import ComputedPropertyDescriptor from './ComputedPropertyDescriptor'
import GenericPropertyDescriptor, {
  NON_ENUMERABLE_DESCRIPTOR,
  PERMISSIVE_DESCRIPTOR,
} from './GenericPropertyDescriptor'

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const getOwnPropertyNames = Object.getOwnPropertyNames
const nativeDefineProperty = Object.defineProperty
const hasOwnProperty = Object.prototype.hasOwnProperty
const isNaN = Number.isNaN
const storageKey = Symbol.for('observable')
const DEFAULT_DESCRIPTOR: GenericPropertyDescriptor = {
  configurable: true,
  enumerable: true,
}

export type ObservablePropertyKey = string | number

function canRedefineProperty(object: Object, property: PropertyKey): boolean {
  const definedDescriptor = getOwnPropertyDescriptor(object, property)

  return null == definedDescriptor || true === definedDescriptor.configurable
}

function normalizeDescriptor(
  descriptor?: GenericPropertyDescriptor,
  defaultValue?: any
): GenericPropertyDescriptor {
  if (null != descriptor && getOwnPropertyNames(descriptor).length > 0) {
    // Cater for pre-defined getter/setters.
    const { writable, get, set } = descriptor
    const hasValue = hasOwnProperty.call(descriptor, 'value')

    if ((get || set) && (hasValue || writable)) {
      throw new Error(
        'Invalid property descriptor. Cannot both specify accessors and a value or writable attribute'
      )
    }

    descriptor = { ...DEFAULT_DESCRIPTOR, ...descriptor }

    if (!get && !hasValue && undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  } else {
    descriptor = { ...DEFAULT_DESCRIPTOR }

    if (undefined !== defaultValue) {
      descriptor.value = defaultValue
    }
  }

  return descriptor
}

export default class ObservableObject implements Object {
  [index: number]: any
  [key: string]: any

  public static readonly observable: symbol = storageKey;

  private [storageKey]: Observer

  public constructor(object: object) {
    Object.defineProperty(this, storageKey, {
      ...NON_ENUMERABLE_DESCRIPTOR,
      value: new Observer(object, this),
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

  public static defineProperty(
    observableObject: ObservableObject,
    property: ObservablePropertyKey,
    descriptor?: ObservablePropertyDescriptor & ThisType<ObservableObject>
  ): void {
    if (!canRedefineProperty(observableObject, property)) {
      throw new TypeError(`Cannot redefine property: ${property}`)
    }

    const storage: Observer = observableObject[storageKey]
    descriptor = normalizeDescriptor(descriptor, observableObject[property])
    const { enumerable, configurable, get, set } = descriptor
    let { value } = descriptor

    Object.defineProperty(observableObject, property, {
      ...{
        enumerable,
        configurable,
      },
      get: function reactiveGetter(): any {
        storage.dependOnProperty(property)

        return get ? get.call(observableObject, observableObject) : value
      },
      set: function reactiveSetter(newValue: any): void {
        const oldValue = get
          ? get.call(observableObject, observableObject)
          : value

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

    const storage: Observer = observableObject[storageKey]
    descriptor = normalizeDescriptor(descriptor, observableObject[computedProperty])
    const { enumerable, configurable, value, get, set } = descriptor
    const getValue = value || get

    if (!getValue) {
      throw new TypeError(
        'Invalid property descriptor. Computed property descriptor should have value or getter'
      )
    }

    storage.dependentObserver = function(
      newValue: any,
      oldValue: any,
      property: ObservablePropertyKey,
      observableObject: ObservableObject
    ): any {
      observableObject[computedProperty] = getValue.call(
        observableObject,
        newValue,
        oldValue,
        property,
        observableObject
      )
    }
    // Collect properties on which this computed property dependent
    let computedValue: any = getValue.call(
      observableObject,
      undefined,
      undefined,
      computedProperty,
      observableObject
    )
    Object.defineProperty(observableObject, computedProperty, {
      ...{
        enumerable,
        configurable,
      },
      get: function reactiveGetter(): any {
        storage.dependOnProperty(computedProperty)

        return computedValue
      },
      set: function reactiveSetter(newValue: any): void {
        const oldValue = computedValue

        if (newValue === oldValue || (isNaN(newValue) && isNaN(oldValue))) {
          return
        }

        computedValue = newValue

        if (set) {
          set.call(
            observableObject,
            newValue,
            oldValue,
            computedProperty,
            observableObject
          )

          storage.dispatchPropertyObservers(
            computedProperty,
            newValue,
            oldValue
          )
        }
      },
    })

    delete storage.dependentObserver
  }

  public static observeProperty(
    observableObject: ObservableObject,
    property: ObservablePropertyKey,
    observer: ObserveFunction
  ): void {
    observableObject[storageKey].observeProperty(property, observer)
  }

  public static observeProperties(
    observableObject: ObservableObject,
    properties: Array<ObservablePropertyKey>,
    observer: ObserveFunction
  ): void {
    properties.forEach(function(property: ObservablePropertyKey): void {
      observableObject[storageKey].observeProperty(property, observer)
    })
  }
}

export const defineProperty = ObservableObject.defineProperty

export const defineComputedProperty = ObservableObject.defineComputedProperty
