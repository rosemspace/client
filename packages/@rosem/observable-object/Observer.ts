import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ObserveFunction from './ObserveFunction'

export default class Observer {
  public dependentObserver?: ObserveFunction

  private readonly observableObject: ObservableObject

  private observers: { [key: string]: Array<ObserveFunction> } = {}

  public constructor(
    observableObject: ObservableObject
  ) {
    this.observableObject = observableObject
  }

  public observeProperty(
    property: ObservablePropertyKey,
    observer: ObserveFunction
  ): void {
    if (!this.observers[property]) {
      this.observers[property] = [observer]
    } else {
      this.observers[property].push(observer)
    }
  }

  public dependOnProperty(property: ObservablePropertyKey): void {
    if (this.dependentObserver) {
      this.observeProperty(property, this.dependentObserver)
    }
  }

  public dispatchPropertyObservers(
    property: ObservablePropertyKey,
    newValue: any,
    oldValue: any
  ): void {
    if (this.observers[property]) {
      this.observers[property].forEach((observer: ObserveFunction): void => {
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
