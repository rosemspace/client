import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'

const hasOwnProperty = Object.prototype.hasOwnProperty

export default class Observable<T extends ObservableObject> {
  private readonly target: T
  private readonly observers: Observer<T>[] = []
  private readonly propertyObservers: {
    [property: string]: Observer<T>[]
  } = {}

  constructor(target: T) {
    this.target = target
  }

  observe(observer: Observer<T>): void {
    if (-1 === this.observers.indexOf(observer)) {
      this.observers.push(observer)
    }
  }

  observeProperty(
    property: ObservablePropertyKey,
    observer: Observer<T>
  ): void {
    if (!this.propertyObservers[property]) {
      this.propertyObservers[property] = [observer]
    } else if (-1 === this.propertyObservers[property].indexOf(observer)) {
      this.propertyObservers[property].push(observer)
    }
  }

  notify(newValue: any, oldValue: any, property?: ObservablePropertyKey): void {
    this.observers.forEach((observer: Observer<T>): void => {
      observer.call(this.target, newValue, oldValue, property, this.target)
    })
  }

  notifyProperty(
    newValue: any,
    oldValue: any,
    property: ObservablePropertyKey
  ): void {
    if (hasOwnProperty.call(this.target, property)) {
      this.notify(newValue, oldValue, property)

      if (this.propertyObservers[property]) {
        this.propertyObservers[property].forEach(
          (observer: Observer<T>): void => {
            observer.call(
              this.target,
              newValue,
              oldValue,
              property,
              this.target
            )
          }
        )
      }
    }
  }
}
