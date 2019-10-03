import Observable from './Observable'
import Observer from './Observer'
import observe, { observeProperty, observeProperties } from './observe'
import { OBSERVATION_KEY } from './index'

export type ObservablePropertyKey = string | number

export default class ObservableObject extends Object implements Object {
  [OBSERVATION_KEY]: Observable<ObservableObject>
  [index: number]: any
  [key: string]: any

  //todo: notify observers through setter

  static create(object?: object | null): ObservableObject {
    return new ObservableObject(object)
  }

  observe(observer: Observer): void {
    observe(this, observer)
  }

  observeProperty(property: ObservablePropertyKey, observer: Observer): void {
    observeProperty(this, property, observer)
  }

  observeProperties(
    properties: Array<ObservablePropertyKey>,
    observer: Observer
  ): void {
    observeProperties(this, properties, observer)
  }
}
