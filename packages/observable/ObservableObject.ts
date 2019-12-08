import Observable from './Observable'
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

  static observe = observe

  static observeProperty = observeProperty

  static observeProperties = observeProperties
}
