import config from './config'

interface ReactivePropertyDescriptor {
  // configurable?: boolean
  // enumerable?: boolean
  value?: any
  shallow?: boolean
  // writable?: boolean
  get?(): any
  set?(value: any): void
}

interface ReactiveComputedPropertyDescriptor
  extends ReactivePropertyDescriptor {
  value?: Function
  lazy?: boolean
}

export default class ReactiveObject {
  // protected observable: any

  public constructor(object: any) {
    // this.observable = object
    Object.defineProperty(this, config.REACTIVE_OBJECT_KEY, {
      value: {
        observable: object,
        dependencies: {},
      },
      enumerable: false,
      writable: true,
      configurable: true,
    })

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

  public static defineProperty(
    object: any,
    property: PropertyKey,
    { value }: ReactivePropertyDescriptor
  ) {
    Object.defineProperty(object, property, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        const storage = object[config.REACTIVE_OBJECT_KEY]

        if (!storage.dependencies[property]) {
          storage.dependencies[property] = []
        }

        if (null != storage.target) {
          storage.dependencies[property].push(storage.target)
        }

        return value
      },
      set: function reactiveSetter(newValue) {
        /* eslint-disable no-self-compare */
        if (newValue === value || (newValue !== newValue && value !== value)) {
          return
        }

        value = newValue

        const storage = object[config.REACTIVE_OBJECT_KEY]
        storage.dependencies[property].forEach(
          (dependentProperty: string | number) => {
            object[dependentProperty] = storage.observable[dependentProperty].call(object)
          }
        )
      },
    })
  }

  public static defineComputedProperty(
    object: any,
    property: PropertyKey,
    { value, lazy }: ReactiveComputedPropertyDescriptor
  ) {
    if (null != value && !lazy) {
      const storage = object[config.REACTIVE_OBJECT_KEY]
      storage.target = property
      object[property] = value.call(object)
      delete storage.target
    }
  }
}
