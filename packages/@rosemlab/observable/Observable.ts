import { storage } from '.'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'

export default class Observable {
  // public dependentObserver?: ObserveFunction

  private readonly target: ObservableObject

  private observers: { [key: string]: Array<Observer> } = {}

  public constructor(
    target: ObservableObject
  ) {
    this.target = target
  }

  public observeProperty(
    property: ObservablePropertyKey,
    observer: Observer
  ): void {
    if (!this.observers[property]) {
      this.observers[property] = [observer]
    } else if (-1 === this.observers[property].indexOf(observer)) {
      this.observers[property].push(observer)
    }
  }

  public dependOnProperty(property: ObservablePropertyKey): void {
    if (storage.observer) {
      this.observeProperty(property, storage.observer)
    }
  }

  public notifyPropertyObserver(
    property: ObservablePropertyKey,
    newValue: any,
    oldValue: any
  ): void {
    if (this.observers[property]) {
      this.observers[property].forEach((observer: Observer): void => {
        observer.call(
          this.target,
          newValue,
          oldValue,
          property,
          this.target
        )
      })
    }
  }
}
