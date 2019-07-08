import { storage } from '.'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'

const hasOwnProperty = Object.prototype.hasOwnProperty

export default class Observable {
  private readonly target: ObservableObject
  private readonly observers: Array<Observer> = []
  private readonly propertyObservers: {
    [property: string]: Array<Observer>
  } = {}

  constructor(target: ObservableObject) {
    this.target = target
  }

  observe(observer: Observer): void {
    this.observers.push(observer)
  }

  observeProperty(property: ObservablePropertyKey, observer: Observer): void {
    if (!this.propertyObservers[property]) {
      this.propertyObservers[property] = [observer]
    } else if (-1 === this.propertyObservers[property].indexOf(observer)) {
      this.propertyObservers[property].push(observer)
    }
  }

  dependOnProperty(property: ObservablePropertyKey): void {
    if (storage.observer) {
      this.observeProperty(property, storage.observer)
    }
  }

  notifyPropertyObserver(
    property: ObservablePropertyKey,
    newValue: any,
    oldValue: any
  ): void {
    if (hasOwnProperty.call(this.target, property)) {
      this.observers.forEach((observer: Observer): void => {
        observer.call(this.target, newValue, oldValue, property, this.target)
      })

      if (this.propertyObservers[property]) {
        this.propertyObservers[property].forEach((observer: Observer): void => {
          observer.call(this.target, newValue, oldValue, property, this.target)
        })
      }
    }
  }
}
