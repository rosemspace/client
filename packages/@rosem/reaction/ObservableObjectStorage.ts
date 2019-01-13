import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ObserverFunction from './ObserverFunction'

export default class ObservableObjectStorage {
  public dependentObserver?: ObserverFunction

  public readonly originalObject: object

  private readonly observableObject: ObservableObject

  private observers: { [key: string]: Array<ObserverFunction> } = {}

  public constructor(
    originalObject: object,
    observableObject: ObservableObject
  ) {
    this.originalObject = originalObject
    this.observableObject = observableObject
  }

  public observeProperty(
    property: ObservablePropertyKey,
    observer: ObserverFunction
  ): void {
    if (!this.observers[property]) {
      this.observers[property] = [observer]
    } else {
      this.observers[property].push(observer)
    }
  }

  public dependOnProperty(property: ObservablePropertyKey): void {
    if (null != this.dependentObserver) {
      this.observeProperty(property, this.dependentObserver)
    }
  }

  public dispatchPropertyObservers(
    property: ObservablePropertyKey,
    newValue: any,
    oldValue: any
  ): void {
    if (this.observers[property]) {
      this.observers[property].forEach((observer: ObserverFunction): void => {
        observer.call(
          this.observableObject,
          newValue,
          oldValue,
          property,
          this.observableObject
        )
      })
    }
  }
}
