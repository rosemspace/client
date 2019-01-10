import ReactivePropertyDescriptor from './ReactivePropertyDescriptor'
import ReactiveObjectStorage from './ReactiveObjectStorage'
import ReactiveComputedPropertyDescriptor from './ReactiveComputedPropertyDescriptor'
import propertyDescriptor, {
  NON_ENUMERABLE,
} from '@rosem/decorator/propertyDescriptor'

type ReactivePropertyKey = string | number
// type ReactivePropertyGetter = ReactivePropertyKey | Function
const reaction = Symbol.for('reaction')
const isNaN = Number.isNaN

export default class ReactiveObject {
  public static reaction: symbol = reaction

  @propertyDescriptor(NON_ENUMERABLE)
  public [reaction]: ReactiveObjectStorage
  [index: number]: any
  [key: string]: any

  public constructor(object?: any) {
    this[reaction] = new ReactiveObjectStorage(object)

    for (const [key, value] of Object.entries(object)) {
      // TODO: remake it because it made just for tests
      if (typeof value === 'function') {
        ReactiveObject.defineComputedProperty(this, key, {
          value,
        })
      } else {
        ReactiveObject.defineProperty(this, key, {
          value,
        })
      }
    }
  }

  public static create(object: any): ReactiveObject {
    return new ReactiveObject(object)
  }

  protected static defineDescriptiveProperty(
    reactiveObject: ReactiveObject,
    property: ReactivePropertyKey,
    descriptor: ReactivePropertyDescriptor
  ) {}

  public static defineProperty(
    reactiveObject: ReactiveObject,
    property: ReactivePropertyKey,
    descriptor: ReactivePropertyDescriptor
  ) {
    let { value } = descriptor
    const storage: ReactiveObjectStorage = reactiveObject[reaction]
    const originalObject: any = storage.originalObject
    const observers: { [index: string]: Array<Function> } = storage.observers
    const dependencies: { [index: string]: Array<string> } =
      storage.dependencies

    const originalDescriptor = Object.getOwnPropertyDescriptor(
      originalObject,
      property
    )
    let getter: Function | undefined
    let setter: Function | undefined

    if (originalDescriptor) {
      if (originalDescriptor.configurable === false) {
        return
      }

      // Cater for pre-defined getter/setters
      getter = originalDescriptor.get
      setter = originalDescriptor.set

      // todo comment: For setter properties without getter
      if ((!getter || setter) && arguments.length === 2) {
        value = reactiveObject[property]
      }
    }

    Object.defineProperty(reactiveObject, property, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        // DEPEND
        if (null != storage.target) {
          if (!dependencies[property]) {
            dependencies[property] = [storage.target]
          } else {
            dependencies[property].push(storage.target)
          }
        }

        return getter ? getter.call(reactiveObject) : value
      },
      set: function reactiveSetter(newValue) {
        const oldValue = getter ? getter.call(reactiveObject) : value

        if (
          newValue === oldValue ||
          (isNaN(newValue) && isNaN(oldValue)) ||
          // For accessor properties without setter
          (getter && !setter)
        ) {
          return
        }

        setter ? setter.call(reactiveObject, newValue) : (value = newValue)

        // NOTIFY
        // Handle observers
        observers[property] &&
          observers[property].forEach((observer: Function) => {
            observer.call(reactiveObject)
          })

        // Handle computed properties
        dependencies[property] &&
          dependencies[property].forEach(
            (dependentProperty: ReactivePropertyKey) => {
              reactiveObject[dependentProperty] = originalObject[
                dependentProperty
              ].call(reactiveObject)
            }
          )
      },
    })
  }

  public static defineComputedProperty(
    reactiveObject: ReactiveObject,
    property: ReactivePropertyKey,
    descriptor: ReactiveComputedPropertyDescriptor
  ) {
    const { value } = descriptor

    if (!descriptor.lazy) {
      const storage: ReactiveObjectStorage = reactiveObject[reaction]
      storage.target = String(property)
      reactiveObject[property] = value.call(reactiveObject)
      delete storage.target
    }
  }

  public static observe(
    reactiveObject: ReactiveObject,
    property: ReactivePropertyKey,
    callback: Function
  ) {
    const storage: ReactiveObjectStorage = reactiveObject[reaction]
    const observers: { [index: string]: Array<Function> } = storage.observers

    if (storage.originalObject.hasOwnProperty(property)) {
      if (!observers[property]) {
        observers[property] = [callback]
      } else {
        observers[property].push(callback)
      }
    }
  }
}
