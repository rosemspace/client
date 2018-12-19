/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
import config from './config'
import Dependency from './Dependency'
import defineProperty from './defineProperty'
import defineReactiveProperty from './defineReactiveProperty'
import hasProto from '@rosem/util-check/hasProto'

export class Observer {
  observable: Object | any[]
  dependency: Dependency

  constructor(
    observable: Object | any[]
  ) {
    this.observable = observable
    this.dependency = new Dependency()
    defineProperty(observable, config.REACTIVE_OBJECT_KEY, this)

    if (Array.isArray(observable)) {
      if (hasProto) {
        // protoAugment(observable, arrayMethods)
      } else {
        // copyAugment(observable, arrayMethods, arrayKeys)
      }

      Observer.observeArray(observable)
    } else {
      Observer.walk(observable)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  static walk(object: Object) {
    const keys = Object.keys(object)

    for (let i = 0; i < keys.length; i++) {
      defineReactiveProperty(object, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  static observeArray(items: any[]) {
    for (let index = 0, l = items.length; index < l; ++index) {
      // observe(items[index])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target: Object | any[], src: Object) {
  /* eslint-disable no-proto */
  // @ts-ignore
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment(
  target: Object,
  src: { [key: string]: any },
  keys: Array<string>
) {
  for (let index = 0, l = keys.length; index < l; ++index) {
    const key: string = keys[index]
    defineProperty(target, key, src[key])
  }
}
