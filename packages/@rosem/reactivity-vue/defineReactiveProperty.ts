import Dependency from './Dependency'

export default function defineReactiveProperty(
  object: {[key: string]: any},
  key: string,
  value?: any,
  shallow?: boolean
) {
  const property = Object.getOwnPropertyDescriptor(object, key)
  let getter: Function | undefined
  let setter: Function | undefined

  if (property) {
    if (property.configurable === false) {
      return
    }

    // cater for pre-defined getter/setters
    getter = property.get
    setter = property.set

    if ((!getter || setter) && arguments.length === 2) {
      value = object[key]
    }
  }

  const dep = new Dependency()

  // let childOb = !shallow && observe(value)
  Object.defineProperty(object, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const resolvedValue = getter ? getter.call(object) : value

      if (Dependency.target) {
        dep.depend()

        // if (childOb) {
        //   childOb.dep.depend()
        //
          // if (Array.isArray(resolvedValue)) {
          //   dependArray(resolvedValue)
          // }
        // }
      }
      return resolvedValue
    },
    set: function reactiveSetter (newValue) {
      const oldValue = getter ? getter.call(object) : value

      /* eslint-disable no-self-compare */
      if (newValue === oldValue || (newValue !== newValue && oldValue !== oldValue)) {
        return
      }

      // For accessor properties without setter
      if (getter && !setter) return

      if (setter) {
        setter.call(object, newValue)
      } else {
        value = newValue
      }

      // childOb = !shallow && observe(newValue)
      dep.notify()
    }
  })
}
