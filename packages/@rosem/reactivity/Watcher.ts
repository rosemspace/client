import Dependency from './Dependency'
import createPropertyGetterFromPath from './createPropertyGetterFromPath'

export default class Watcher {
  getter: Function
  callback: Function
  deep: boolean = false
  lazy: boolean = false
  value: any
  dependencies: Dependency[] = []
  newDependencies: Dependency[] = []
  dependencyIds: Set<any> //SimpleSet
  newDependencyIds: Set<any> //SimpleSet

  constructor(
    expressionOrFunction: string | Function,
    callback: Function,
    options?: Object
  ) {
    // parse expression for getter
    if (typeof expressionOrFunction !== 'function') {
      const getter = createPropertyGetterFromPath(expressionOrFunction)

      if (null != getter) {
        this.getter = getter
      } else {
        throw new Error(
          `Failed observe path: "${expressionOrFunction}" ` +
            'Observer only accepts simple dot-delimited paths. ' +
            'For full control, use a function instead.'
        )
      }
    } else {
      this.getter = expressionOrFunction
    }

    this.dependencyIds = new Set()
    this.newDependencyIds = new Set()
    this.callback = callback
    this.value = this.lazy ? undefined : this.get()
  }

  /**
   * Add a dependency to this directive.
   */
  addDependency(dependency: Dependency) {
    const id = dependency.id

    if (!this.newDependencyIds.has(id)) {
      this.newDependencyIds.add(id)
      this.newDependencies.push(dependency)

      if (!this.dependencyIds.has(id)) {
        dependency.addWatcher(this)
      }
    }
  }

  get() {}

  update() {
    console.log('test2');
  }
}
